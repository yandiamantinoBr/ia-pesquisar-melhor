import { roomRecord, state, json, isHost, participant, failure } from '@/lib/server';
export async function GET(req:Request,{params}:{params:Promise<{room:string}>}) {
 try { const {room}=await params;const record=await roomRecord(room);if(!record)return json({error:'Sessão não encontrada ou expirada.'},404);
 const host=await isHost(req,record);if(req.headers.has('authorization')&&!host)return json({error:'Chave de controle inválida. Escaneie novamente o QR Code privado.'},403);
 const p=participant(req);return json(await state(record,host),200,p.header);
 } catch(e){return failure(e);}
}
