import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://127.0.0.1:5173';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) {
  throw new Error('This suite creates synthetic participation data and is restricted to a local server.');
}
const checks = [];
async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: text }; }
  return { response, data, status: response.status };
}
function passed(name) { checks.push({ name, passed: true }); console.log(`PASS ${name}`); }
function cookie(response) {
  const value = response.headers.get('set-cookie');
  assert.ok(value?.includes('HttpOnly'));
  assert.ok(value?.includes('SameSite=Lax'));
  return value.split(';')[0];
}

let session;
try {
  assert.equal((await request('/api/sessions', { method: 'POST', headers: { Origin: 'https://outside.invalid' } })).status, 403);
  passed('Cross-origin session creation is blocked');

  const created = await request('/api/sessions', { method: 'POST' });
  assert.equal(created.status, 201);
  assert.match(created.data.room, /^[A-Z2-9]{6}$/);
  assert.match(created.data.hostKey, /^[a-f0-9]{64}$/);
  session = created.data;
  const path = `/api/sessions/${session.room}`;
  const auth = { Authorization: `Bearer ${session.hostKey}` };
  const publicRead = await request(path);
  assert.equal(publicRead.status, 200);
  assert.equal(publicRead.data.total, 0);
  assert.equal(publicRead.data.slide, 0);
  assert.equal('experiences' in publicRead.data, false);
  assert.equal('hostKey' in publicRead.data, false);
  assert.equal(publicRead.response.headers.get('cache-control'), 'no-store');
  const firstCookie = cookie(publicRead.response);
  passed('Session creation and anonymous state use the expected shape and private cookie');

  assert.equal((await request(path, { headers: { Authorization: `Bearer ${'a'.repeat(64)}` } })).status, 403);
  assert.equal((await request(`${path}/control`, { method: 'POST', body: { action: 'slide', slide: 3 } })).status, 403);
  assert.equal((await request(`${path}/control`, { method: 'POST', headers: { Authorization: `Bearer ${'b'.repeat(64)}` }, body: { action: 'slide', slide: 3 } })).status, 403);
  passed('A participant or incorrect host key cannot control the presentation');

  const controlled = await request(`${path}/control`, { method: 'POST', headers: auth, body: { action: 'slide', slide: 3 } });
  assert.equal(controlled.status, 200);
  assert.equal(controlled.data.slide, 3);
  assert.equal((await request(path)).data.slide, 3);
  assert.equal((await request(`${path}/control`, { method: 'POST', headers: auth, body: { action: 'slide', slide: 20 } })).status, 400);
  assert.equal((await request(`${path}/control`, { method: 'POST', headers: auth, body: '{invalid' })).status, 400);
  const blank = await request(`${path}/control`, { method: 'POST', headers: auth, body: { action: 'blackout', value: true } });
  assert.equal(blank.data.blackout, true);
  assert.equal((await request(path)).data.blackout, true);
  await request(`${path}/control`, { method: 'POST', headers: auth, body: { action: 'blackout', value: false } });
  passed('Authorized slide and blackout controls synchronize, with invalid commands rejected');

  for (const body of [
    { selections: [], experience: '' },
    { selections: [0, 1], experience: '' },
    { selections: [1, 1], experience: '' },
    { selections: [4], experience: '' },
    { selections: [1], experience: 'a'.repeat(161) },
  ]) assert.equal((await request(`${path}/responses`, { method: 'POST', headers: { Cookie: firstCookie }, body })).status, 400);
  assert.equal((await request(`${path}/responses`, { method: 'POST', body: '{invalid' })).status, 400);
  assert.equal((await request(`${path}/responses`, { method: 'POST', headers: { Origin: 'https://outside.invalid' }, body: { selections: [1], experience: '' } })).status, 403);
  passed('Response validation rejects empty, conflicting, duplicate, invalid and overlong inputs');

  const first = await request(`${path}/responses`, { method: 'POST', headers: { Cookie: firstCookie }, body: { selections: [1, 2], experience: 'uso muito Codex e não uso nada o Claude' } });
  assert.equal(first.status, 200);
  assert.equal(first.data.updated, false);
  let live = (await request(path)).data;
  assert.equal(live.total, 1);
  assert.deepEqual(live.counts, [0, 1, 1, 0]);
  assert.deepEqual(live.words.map(word => word.label), ['Codex']);
  passed('A first response is counted and the requested Codex/negated-Claude example is correct');

  const edit = await request(`${path}/responses`, { method: 'POST', headers: { Cookie: firstCookie }, body: { selections: [3], experience: 'Uso Codex para resumir, mas não uso Claude' } });
  assert.equal(edit.status, 200);
  assert.equal(edit.data.updated, true);
  live = (await request(path)).data;
  assert.equal(live.total, 1);
  assert.deepEqual(live.counts, [0, 0, 0, 1]);
  assert.equal(live.words.find(word => word.label === 'Codex')?.count, 1);
  assert.equal(live.words.find(word => word.label === 'resumo')?.count, 1);
  assert.equal(live.words.some(word => word.label === 'Claude'), false);
  passed('Editing the same browser response replaces selections and text without an extra participant');

  const secondCookie = cookie((await request(path)).response);
  assert.notEqual(firstCookie, secondCookie);
  await request(`${path}/responses`, { method: 'POST', headers: { Cookie: secondCookie }, body: { selections: [0], experience: 'Nunca usei IA' } });
  const thirdCookie = cookie((await request(path)).response);
  await request(`${path}/responses`, { method: 'POST', headers: { Cookie: thirdCookie }, body: { selections: [1], experience: 'Resumos e sínteses com Codex' } });
  live = (await request(path)).data;
  assert.equal(live.total, 3);
  assert.deepEqual(live.counts, [1, 1, 0, 1]);
  assert.equal(live.words.find(word => word.label === 'Codex')?.count, 2);
  const summary = live.words.find(word => word.label === 'resumo');
  assert.equal(summary?.count, 2);
  assert.deepEqual(new Set(summary?.variants), new Set(['resumos', 'sínteses', 'resumir']));
  assert.equal(live.words.some(word => ['Claude', 'nunca', 'usei'].includes(word.label)), false);
  passed('Different browsers count separately, synonyms group and frequency reflects people');

  const hostRead = (await request(path, { headers: auth })).data;
  assert.equal(hostRead.experiences.length, 3);
  assert.equal('experiences' in live, false);
  assert.equal('host_hash' in live, false);
  assert.equal(JSON.stringify(live).includes('Nunca usei IA'), false);
  passed('Full experience text is returned only to the authorized host');

  await request(`${path}/control`, { method: 'POST', headers: auth, body: { action: 'poll', open: false } });
  assert.equal((await request(path)).data.pollOpen, false);
  assert.equal((await request(`${path}/responses`, { method: 'POST', headers: { Cookie: firstCookie }, body: { selections: [1], experience: '' } })).status, 409);
  await request(`${path}/control`, { method: 'POST', headers: auth, body: { action: 'poll', open: true } });
  assert.equal((await request(path)).data.pollOpen, true);
  passed('The presenter pauses and resumes participation, and the API enforces the pause');

  assert.equal((await request('/api/sessions/INVALID')).status, 404);
  passed('Unknown or malformed room codes return a clear missing-session response');
} catch (error) {
  checks.push({ name: 'Suite failure', passed: false, message: error.message });
  process.exitCode = 1;
  console.error(error);
} finally {
  const report = {
    verifiedAt: new Date().toISOString(), target: 'local development API',
    checks, totalChecks: checks.length, passed: checks.every(check => check.passed),
    database: 'Local Miniflare D1 only; no production data changed',
    browserVerification: 'Unavailable: browser origin gate denied this local origin; no alternate browser path used',
    limits: ['HTTP checks and static UI trace; physical QR scanning and visual animation not browser-verified'],
  };
  writeFileSync(fileURLToPath(new URL('./integration-report.json', import.meta.url)), JSON.stringify(report, null, 2));
}
