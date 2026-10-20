'use client';
import {useLayoutEffect,useRef} from 'react';
import type {LiveState} from '@/lib/deck';

export function WordCloud({words,onSelect}:{words:LiveState['words'];onSelect:(word:LiveState['words'][number])=>void}) {
 const root=useRef<HTMLDivElement>(null);
 const positions=useRef(new Map<string,DOMRect>());
 const visible=words.slice(0,18);
 const signature=visible.map(w=>`${w.label}:${w.count}`).join('|');
 useLayoutEffect(()=>{
  const next=new Map<string,DOMRect>();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.current?.querySelectorAll<HTMLElement>('[data-term]').forEach(el=>{
   const label=el.dataset.term!,rect=el.getBoundingClientRect(),previous=positions.current.get(label);
   next.set(label,rect);
   if(!reduced && !previous)el.animate([{opacity:0,transform:'scale(.75)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'cubic-bezier(.2,.7,.3,1)'});
   else if(!reduced && previous && (Math.abs(previous.x-rect.x)>2||Math.abs(previous.y-rect.y)>2))el.animate([{transform:`translate(${previous.x-rect.x}px,${previous.y-rect.y}px)`},{transform:'translate(0,0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});
  });
  positions.current=next;
 },[signature]);
 return <div ref={root} className="word-cloud" aria-label="Nuvem de palavras das respostas">{visible.length?visible.map(w=>{
  const tone=[...w.label].reduce((n,c)=>n+c.charCodeAt(0),0)%4;
  return <button key={w.label} data-term={w.label} onClick={()=>onSelect(w)} className={`cloud-word color-${tone}`} style={{'--cloud-scale':Math.min(2.5,1+Math.log2(w.count)*.33)} as React.CSSProperties} title={`${w.count} ${w.count===1?'participante':'participantes'}. Variações: ${w.variants.join(', ')}`}>{w.label}</button>;
 }):<p className="cloud-empty">As palavras da turma aparecem aqui.</p>}</div>;
}
