import { db, roomRecord, json, readBody, originOK, participant, failure } from '@/lib/server';
export async function POST(req:Request,{params}:{params:Promise<{room:string}>}) {
 try {
  if(!originOK(req))return json({error:'Origem inválida.'},403);
  const {room}=await params, record=await roomRecord(room);if(!record)return json({error:'Sessão não encontrada ou expirada.'},404);
  if(!record.poll_open)return json({error:'A participação está pausada pelo apresentador.'},409);
  const body=await readBody(req), p=participant(req);
  if(!Array.isArray(body.selections)||body.selections.length<1||body.selections.length>3||body.selections.some((v:any)=>!Number.isInteger(v)||v<0||v>3)||(body.selections.includes(0)&&body.selections.length>1)||new Set(body.selections).size!==body.selections.length)return json({error:'Escolha ao menos uma etapa. “Ainda não usei” é uma opção exclusiva.'},400);
  if(typeof body.experience!=='string'||[...body.experience].length>160)return json({error:'A experiência deve ter até 160 caracteres.'},400);
  const existing=await db().prepare('SELECT id FROM responses WHERE room = ? AND participant = ?').bind(room,p.id).first();
  const total=await db().prepare('SELECT COUNT(*) AS total FROM responses WHERE room = ?').bind(room).first<any>();
  if(!existing&&total.total>=500)return json({error:'Esta sessão atingiu o limite de 500 participantes.'},409);
  const experience=body.experience.trim().replace(/[\u0000-\u001f\u007f]/g,' ');
  await db().prepare('INSERT INTO responses (id, room, participant, selections, experience, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(room, participant) DO UPDATE SET selections = excluded.selections, experience = excluded.experience').bind(crypto.randomUUID(),room,p.id,JSON.stringify(body.selections),experience,Date.now()).run();
  return json({ok:true,updated:!!existing},200,p.header);
 }catch(e){if(e instanceof SyntaxError || (e instanceof Error&&e.message==='invalid_body'))return json({error:'Pedido inválido.'},400);return failure(e);}
}
