import { db, hash, json, originOK, failure } from '@/lib/server';
export async function POST(req:Request) {
 try {
  if(!originOK(req)) return json({error:'Origem inválida.'},403);
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789', random=crypto.getRandomValues(new Uint8Array(6));
  const room=[...random].map(v=>chars[v%chars.length]).join('');
  const hostKey=[...crypto.getRandomValues(new Uint8Array(32))].map(v=>v.toString(16).padStart(2,'0')).join('');
  await db().prepare('INSERT INTO sessions (id, host_hash, slide, poll_open, blackout, revision, created_at, expires_at) VALUES (?, ?, 0, 1, 0, 0, ?, ?)').bind(room,await hash(hostKey),Date.now(),Date.now()+7*86400000).run();
  return json({room,hostKey},201);
 } catch(e){return failure(e);}
}
