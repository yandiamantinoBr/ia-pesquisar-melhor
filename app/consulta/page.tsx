'use client';

import {Slide,glossary} from '../slides';
import {POLL_OPTIONS,SLIDES} from '@/lib/deck';
import SOURCES from '@/lib/references.json';
import './consulta.css';

type Reference={id:string;authors:string;title:string;url:string;abnt:string;accessed:string|null;section?:string;accessNote?:string;teachingNote?:string;year:number|null};
const references=SOURCES.references as Reference[];
const SITE='https://ia-pesquisar-melhor-yan.yandiamantinobr.chatgpt.site';
const PDF='/downloads/ia-pesquisar-melhor-v1.1.0.pdf';
const noAction=()=>{};

type Support={id:string;after:number;title:string;subtitle:string;src?:string;layout?:'portrait'|'wide'|'document'|'strip';credit:string;sourceIds:string[];notes:string[]};
const supports:Support[]=[
 {id:'modelo-agente',after:5,title:'Modelo, ferramentas e contexto',subtitle:'Imagem ampliada · slide 5',src:'/assets/image6.png',layout:'portrait',credit:'IBM Technology · captura do vídeo fornecida na apresentação original.',sourceIds:['ibmvideo','ibmllm','ibmrag','mcp'],notes:['O treinamento estabelece padrões antes da conversa.','O pedido e as fontes fornecidas compõem o contexto usado agora.','Um agente combina o modelo com ferramentas, regras e permissões para executar etapas.']},
 {id:'api-agi',after:6,title:'API e AGI, para consultar depois',subtitle:'Complemento do glossário · slide 6',credit:'Definições adaptadas de IBM Think. O título bibliográfico do vídeo IBM mantém ASI.',sourceIds:['ibmapi','ibmagi'],notes:[]},
 {id:'inteligencia-preco',after:7,title:'Comparação entre inteligência e preço',subtitle:'Imagem ampliada · slide 7 · captura histórica de 07/10/2026',src:'/assets/image7.png',layout:'wide',credit:'Artificial Analysis · captura reproduzida da apresentação original.',sourceIds:['aa'],notes:['A captura registra uma comparação em uma data específica. Escores, preços e posições podem mudar.']},
 {id:'intelligence-index',after:7,title:'Artificial Analysis Intelligence Index',subtitle:'Imagem ampliada · slide 7 · captura histórica de 07/10/2026',src:'/assets/image8.png',layout:'wide',credit:'Artificial Analysis · captura reproduzida da apresentação original.',sourceIds:['aa'],notes:['O índice reúne avaliações específicas. Seu escore não é uma porcentagem de inteligência.']},
 {id:'chat-work-code',after:9,title:'As ferramentas disponíveis mudam a tarefa',subtitle:'Imagem ampliada · slide 9',src:'/assets/image19.png',layout:'wide',credit:'OpenAI / ChatGPT · captura da barra Chat, Work e Code fornecida no PowerPoint.',sourceIds:['chatgpt'],notes:['Arquivos, navegação, execução e permissões variam conforme a interface e a conta.']},
 {id:'leitura-assistida',after:12,title:'Uma captura de leitura assistida',subtitle:'Imagem ampliada · slide 12',src:'/assets/image41.png',layout:'wide',credit:'Gemini Notebook · captura fornecida pelo apresentador.',sourceIds:['gemininotebook','dsr2013'],notes:['O título visível é “Design Science Research: método de pesquisa para a engenharia de produção”. A tela mostra cinco fontes com nomes truncados; a imagem não permite conferir todas elas nem validar a resposta gerada.']},
 {id:'artigo-abreu',after:15,title:'A publicação original, aberta à conferência',subtitle:'Imagem ampliada · slide 15',src:'/assets/image42.png',layout:'wide',credit:'Cabeçalho do artigo de Júlio Cesar Andrade de Abreu, Cadernos EBAPE.BR, 2016.',sourceIds:['abreu2016'],notes:['Autor, título, ano, periódico e DOI ajudam a identificar a publicação. O artigo estuda o orçamento participativo digital de Belo Horizonte.']},
 {id:'percurso-pesquisa',after:16,title:'Da produção científica à citação',subtitle:'Imagem ampliada · slide 16',src:'/assets/image43.png',layout:'document',credit:'Fluxograma reproduzido do PowerPoint fornecido pelo apresentador; autoria externa não identificada.',sourceIds:['scholar','scopus','webofscience','scielo','capes','zotero'],notes:['Produção → publicação e armazenamento → descoberta → acesso → leitura, análise e citação.','Encontrar uma referência é uma etapa. Abrir e ler a fonte permite conferir o que ela sustenta.']},
 {id:'registro-submissao',after:19,title:'Um registro real de declaração de uso de IA',subtitle:'Imagem ampliada · slide 19 · XXVIII ENGEMA',src:'/assets/image44.png',layout:'wide',credit:'Registro de submissão fornecido pelo apresentador. A reprodução não comprova aceite ou publicação.',sourceIds:['engema_manuscript','engema2026'],notes:['Título no registro: “Design Thinking e sustentabilidade no contexto universitário: o desenvolvimento do protótipo Kino Campus”. A declaração aparece ampliada na próxima página.']},
 {id:'declaracao-ampliada',after:19,title:'A finalidade do uso deve aparecer com clareza',subtitle:'Detalhe ampliado do registro · slide 19',src:'/assets/declaracao.png',layout:'strip',credit:'Recorte do registro de submissão fornecido pelo apresentador.',sourceIds:['engema_manuscript'],notes:['O registro declara apoio na redação, busca bibliográfica, questionário, transcrição, análise de dados e prototipação.','A declaração precisa corresponder ao uso real e às regras da atividade.']},
 {id:'manuscrito-ia',after:19,title:'Descrever o apoio e assumir as decisões',subtitle:'Trecho de manuscrito, p. 4 · slide 19',src:'/assets/image45.png',layout:'document',credit:'Trecho de manuscrito fornecido pelo apresentador, sem folha de rosto. A relação com a edição do TCC de 2025 não foi estabelecida.',sourceIds:['engema_manuscript','sampaio2024'],notes:['O trecho registra transcrição com apoio do Gemini e outros usos de IA.','A conferência do material e as decisões finais são atribuídas ao pesquisador. O trecho cita Sampaio, Sabbatini e Limongi (2024).']},
];

const chunks=<T,>(items:T[],size:number)=>Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,i*size+size));
const productReferences=references.filter(r=>r.section==='Ferramentas e serviços');
const primaryReferences=references.filter(r=>r.section!=='Ferramentas e serviços');
const primaryGroups=chunks(primaryReferences,3);
const productGroups=chunks(productReferences,6);

type Credit={slide:number;credit:string;sourceReference:string|null;relatedReferences?:string[];verificationNote?:string;assets:string[]};
const media=SOURCES.mediaCredits as Credit[];
const logoCredits=media.filter(c=>c.credit.startsWith('Marca '));
const creditItems:Credit[]=[...media.filter(c=>!c.credit.startsWith('Marca ')),{slide:10,assets:logoCredits.flatMap(c=>c.assets),credit:'Logotipos de modelos, produtos e empresas reproduzidos da apresentação original. Os direitos pertencem aos respectivos titulares. Os endereços oficiais constam do catálogo de ferramentas.',sourceReference:null,relatedReferences:logoCredits.map(c=>c.sourceReference).filter((id):id is string=>Boolean(id))}];
const creditGroups=chunks(creditItems,4);

type Page={id:string;kind:'slide';index:number}|{id:string;kind:'support';support:Support}|{id:string;kind:'references';items:Reference[];group:number;products:boolean}|{id:string;kind:'credits';items:Credit[];group:number};
const pages:Page[]=[];
for(let i=0;i<SLIDES.length;i++){
 pages.push({id:`slide-${i+1}`,kind:'slide',index:i});
 for(const support of supports.filter(s=>s.after===i+1))pages.push({id:`apoio-${support.id}`,kind:'support',support});
}
primaryGroups.forEach((items,i)=>pages.push({id:i===0?'fontes':`fontes-${i+1}`,kind:'references',items,group:i,products:false}));
productGroups.forEach((items,i)=>pages.push({id:i===0?'catalogo':`catalogo-${i+1}`,kind:'references',items,group:i,products:true}));
creditGroups.forEach((items,i)=>pages.push({id:i===0?'creditos':`creditos-${i+1}`,kind:'credits',items,group:i}));
const pageNumber=(id:string)=>pages.findIndex(p=>p.id===id)+1;
const source=(id:string)=>references.find(r=>r.id===id);

function SourceLinks({ids}:{ids:string[]}){
 return <span className="consult-source-links">{ids.map(id=>{const ref=source(id);return ref?<a key={id} href={`#ref-${id}`}>{ref.authors.split(';')[0].split(',')[0]} · fonte completa</a>:null;})}</span>;
}

function StaticParticipation(){
 return <article className="slide consult-static-poll"><h1>Onde a IA já entrou no seu trabalho?</h1><h2 className="subheading">Em qual etapa você já usou?</h2><div className="consult-poll-options">{POLL_OPTIONS.map((option,i)=><div key={option}><span>{String(i+1).padStart(2,'0')}</span><strong>{option}</strong></div>)}</div><blockquote>Uma experiência: o que ajudou e o que precisou conferir?</blockquote><p>Na aula, a turma responde pelo celular. As experiências formam uma nuvem: termos semelhantes são agrupados e o tamanho acompanha o número de participantes.</p><a className="consult-live-link" href={SITE}>Participar na versão interativa →</a><div className="slide-foot">Múltipla seleção. “Ainda não usei” é exclusiva. A nuvem é construída durante a sessão.</div></article>;
}

function SupportContent({item}:{item:Support}){
 const api=glossary.find(t=>t[2]==='ibmapi')!;
 const agi=glossary.find(t=>t[2]==='ibmagi')!;
 return <article className={`consult-support support-${item.layout||'concept'}`}><header><p className="consult-eyebrow">{item.subtitle}</p><h1>{item.title}</h1></header>{item.src?<div className="consult-media-area"><figure><img src={item.src} alt={item.title}/></figure><div className="consult-support-notes">{item.notes.map(note=><p key={note}>{note}</p>)}</div></div>:<div className="consult-api-layout"><section><p className="consult-concept-label">07 · API</p><h2>Uma interface entre programas</h2><p>{api[1]}</p><div className="consult-api-flow"><span>Programa</span><b>→</b><span>API</span><b>→</b><span>Serviço</span></div><p className="consult-example">Exemplo: um aplicativo solicita um resumo a um serviço de IA e recebe a resposta.</p></section><section><p className="consult-concept-label">08 · AGI</p><h2>Inteligência geral</h2><p>{agi[1]}</p><p className="consult-example">O termo descreve um conceito em debate. Compare sempre as capacidades demonstradas em cada tarefa.</p></section></div>}<div className="consult-support-credit"><p>{item.credit}</p><SourceLinks ids={item.sourceIds}/></div></article>;
}

function ReferenceContent({items,products,group}:{items:Reference[];products:boolean;group:number}){
 return <article className={`consult-reference-page ${products?'consult-product-page':''}`}><header><p className="consult-eyebrow">Referências completas · {products?'produtos e serviços':'leituras, conceitos e pesquisa'}</p><h1>{products?'Catálogo de ferramentas':'Fontes para consultar'} <span>{group+1}/{products?productGroups.length:primaryGroups.length}</span></h1></header><div className={products?'consult-product-list':'consult-reference-list'}>{items.map(r=><section className="consult-reference-item" id={`ref-${r.id}`} data-reference-id={r.id} key={r.id}>{products?<h2>{r.title}</h2>:null}<p>{r.abnt}</p>{r.url?<a className="consult-reference-url" href={r.url}>{r.url}</a>:null}{r.accessed?<small>Acesso em: {r.accessed}.</small>:null}{r.accessNote?<p className="consult-access-note">{r.accessNote}</p>:null}</section>)}</div><p className="consult-ref-note">Aula de 07/10/2026 · endereços reconferidos em 20/10/2026. Produtos podem exigir conta ou acesso institucional.</p></article>;
}

function CreditContent({items,group}:{items:Credit[];group:number}){
 const note=(value:string)=>value.replace('Trecho sem folha de rosto. Não assumir que a edição é o TCC de 2025; o título do registro de submissão é diferente.','O trecho não contém folha de rosto. A edição não foi identificada com segurança; o título do registro de submissão difere do TCC de 2025.');
 return <article className="consult-credits-page"><header><p className="consult-eyebrow">Proveniência e créditos das imagens</p><h1>De onde vêm as imagens <span>{group+1}/{creditGroups.length}</span></h1></header><div className="consult-credit-list">{items.map((credit,i)=><section key={`${credit.slide}-${i}`}><span>Slide {credit.slide}</span><div><p>{credit.credit}</p>{credit.verificationNote?<small>{note(credit.verificationNote)}</small>:null}{credit.sourceReference?<SourceLinks ids={[credit.sourceReference]}/>:null}</div></section>)}</div><p className="consult-ref-note">As capturas mantêm o contexto histórico do material fornecido pelo apresentador.</p></article>;
}

export default function Consultation(){
 const goToReference=(id:string)=>document.getElementById(id==='all'?'fontes':`ref-${id}`)?.scrollIntoView({behavior:'smooth',block:'center'});
 return <main className="consultation" data-page-count={pages.length} data-reference-count={references.length}>
  <header className="consult-toolbar"><div><a className="consult-back" href="/">← Apresentação interativa</a><h1>Material de consulta</h1><p>{pages.length} páginas em 16:9 · slides, imagens ampliadas e {references.length} fontes</p></div><nav aria-label="Ações do material"><a className="consult-download" href={PDF} download>Baixar PDF</a><button onClick={()=>window.print()}>Imprimir / salvar PDF</button></nav></header>
  <nav className="consult-toc" aria-label="Navegação do material"><a href="#slide-1">Slides da aula</a><a href="#apoio-api-agi">API e AGI</a><a href="#fontes">Fontes completas</a><a href="#catalogo">Ferramentas</a><a href="#creditos">Créditos</a></nav>
  <p className="consult-screen-note">As imagens ampliadas aparecem logo depois do slide de origem. Os links levam às fontes completas; as capturas de modelos continuam datadas de 07/10/2026.</p>
  <div className="consult-pages">{pages.map((page,i)=>{const originalSlide=page.kind==='slide'?page.index+1:page.kind==='support'?page.support.after:null;const extraLinks=page.kind==='slide'?supports.filter(s=>s.after===page.index+1):[];const isDark=page.kind==='slide'&&[1,2,10,12,16].includes(page.index);return <section className={`consult-sheet ${isDark?'consult-sheet-dark':''}`} key={page.id} id={page.id} data-pdf-page={i+1} data-page-kind={page.kind} aria-label={`Página ${i+1} de ${pages.length}`}>{page.kind==='slide'?page.index===3?<StaticParticipation/>:<Slide index={page.index} live={null} room="" origin={SITE} host={false} onStart={noAction} onReference={goToReference}/>:page.kind==='support'?<SupportContent item={page.support}/>:page.kind==='references'?<ReferenceContent items={page.items} products={page.products} group={page.group}/>:<CreditContent items={page.items} group={page.group}/>}<footer className="consult-page-footer"><span>{page.kind==='support'?<a href={`#slide-${originalSlide}`}>Voltar ao slide {originalSlide} · p. {pageNumber(`slide-${originalSlide}`)}</a>:page.kind==='slide'?<>Slide {originalSlide}{extraLinks.length?<a href={`#apoio-${extraLinks[0].id}`}> · Apoio ampliado a seguir</a>:null}</>:<a href="#slide-1">IA para pesquisar melhor · Yan Diamantino</a>}</span><span>{page.kind==='slide'||page.kind==='support'?<a href="#fontes">Fontes completas · p. {pageNumber('fontes')}</a>:null}<b>{String(i+1).padStart(2,'0')} / {pages.length}</b></span></footer></section>;})}</div>
 </main>;
}
