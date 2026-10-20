import { env } from 'cloudflare:workers';
import { aggregateWords } from './words';
export const OPTIONS=['Ainda não usei','Ideias e explicações','Busca e leitura','Escrita e revisão'];
export function db() { if(!env.DB) throw new Error('Database unavailable'); return env.DB; }
export function json(data:unknown,status=200,headers:Record<string,string>={}) {return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
export async function hash(key:string) { const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join(''); }
export async function roomRecord(room:string) { if(!/^[A-Z2-9]{6}$/.test(room)) return null; return db().prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?').bind(room,Date.now()).first<any>(); }
export async function isHost(req:Request,room:any) {const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');return /^[a-f0-9]{64}$/.test(token) && (await hash(token))===room.host_hash;}
export function originOK(req:Request) {const o=req.headers.get('origin');return !o || o===new URL(req.url).origin;}
export async function readBody(req:Request) {const text=await req.text(); if(text.length>4000) throw new Error('invalid_body');return JSON.parse(text);}
export function participant(req:Request) {
 const cookie=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ia_participant='))?.split('=')[1];
 const id=cookie&&/^[a-f0-9-]{36}$/.test(cookie)?cookie:crypto.randomUUID();
 return {id,header:{'Set-Cookie':`ia_participant=${id}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${new URL(req.url).protocol==='https:'?'; Secure':''}`}};
}
export async function state(room:any,host=false) {
 const rr=await db().prepare('SELECT selections, experience, created_at FROM responses WHERE room = ? ORDER BY created_at DESC LIMIT 500').bind(room.id).all<any>();
 const rows=rr.results||[], counts=OPTIONS.map((_,i)=>rows.filter(r=>(JSON.parse(r.selections) as number[]).includes(i)).length);
 return {room:room.id,slide:room.slide,pollOpen:!!room.poll_open,blackout:!!room.blackout,revision:room.revision,expiresAt:room.expires_at,total:rows.length,counts,words:aggregateWords(rows.map(r=>r.experience)),...(host?{experiences:rows.filter(r=>r.experience).map(r=>r.experience)}:{})};
}
export function failure(e:unknown) { console.error('Presentation request failed',e);return json({error:'Não foi possível conectar à sessão. Tente novamente.'},503); }
