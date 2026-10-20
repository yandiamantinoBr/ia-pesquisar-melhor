'use client';
import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';

export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=ref.current;el?.showModal();return ()=>el?.close();},[]);
 return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}><header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar">×</button></header><div className="modal-body">{children}</div></dialog>;
}
export function QR({url,label,size=240}:{url:string;label:string;size?:number}) {
 const [src,setSrc]=useState('');const [failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;setSrc('');setFailed(false);import('qrcode').then(q=>q.toDataURL(url,{width:size*2,margin:3,errorCorrectionLevel:'M',color:{dark:'#142e3d',light:'#ffffff'}})).then(src=>{if(active)setSrc(src);}).catch(()=>{if(active)setFailed(true);});return ()=>{active=false;};},[url,size]);
 return <div className="qr-block">{src?<img src={src} width={size} height={size} alt={label}/>:<div className="qr-placeholder">{failed?'Não foi possível gerar o QR Code. Use o link abaixo.':'Preparando QR Code…'}</div>}</div>;
}
export async function request<T>(url:string,init:RequestInit={}) {
 const res=await fetch(url,{...init,cache:'no-store'});let data:any;try{data=await res.json();}catch{throw new Error('Conexão indisponível. Tente novamente.');}
 if(!res.ok)throw new Error(data.error||'Não foi possível concluir.');return data as T;
}
export function useLive(room:string,key='') {
 const [state,setState]=useState<import('@/lib/deck').LiveState|null>(null),[error,setError]=useState('');
 useEffect(()=>{if(!room)return;let active=true,timer:ReturnType<typeof setTimeout>;
  async function poll(){try{const next=await request<import('@/lib/deck').LiveState>(`/api/sessions/${encodeURIComponent(room)}`,{headers:key?{Authorization:`Bearer ${key}`}:{}});if(active){setState(prev=>prev&&prev.room===next.room&&prev.revision>next.revision?prev:next);setError('');}}catch(e){if(active)setError((e as Error).message);}finally{if(active)timer=setTimeout(poll,document.hidden?5000:1500);}}poll();return ()=>{active=false;clearTimeout(timer);};
 },[room,key]);return {state,setState,error};
}
