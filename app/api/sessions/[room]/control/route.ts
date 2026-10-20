import { db, roomRecord, state, json, isHost, readBody, originOK, failure } from '@/lib/server';
export async function POST(req:Request,{params}:{params:Promise<{room:string}>}) {
 try {
  if(!originOK(req))return json({error:'Origem inválida.'},403);
  const {room}=await params, record=await roomRecord(room);if(!record)return json({error:'Sessão não encontrada ou expirada.'},404);
  if(!await isHost(req,record))return json({error:'O controle exige o QR Code privado do apresentador.'},403);
  const body=await readBody(req);
  const valid=(body.action==='slide'&&Number.isInteger(body.slide)&&body.slide>=0&&body.slide<20)||(body.action==='poll'&&typeof body.open==='boolean')||(body.action==='blackout'&&typeof body.value==='boolean');
  if(!valid)return json({error:'Comando inválido.'},400);
  const field=body.action==='slide'?'slide':body.action==='poll'?'poll_open':'blackout';
  const value=body.action==='slide'?body.slide:body.action==='poll'?Number(body.open):Number(body.value);
  await db().prepare(`UPDATE sessions SET ${field} = ?, revision = revision + 1 WHERE id = ?`).bind(value,room).run();
  return json(await state(await roomRecord(room),true));
 }catch(e){if(e instanceof SyntaxError || (e instanceof Error&&e.message==='invalid_body'))return json({error:'Pedido inválido.'},400);return failure(e);}
}
