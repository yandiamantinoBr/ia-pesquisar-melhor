// Explicit Portuguese vocabulary. No remote AI, guessed semantic similarity or paid API.
export const SYNONYMS: Record<string,string[]> = {
  'resumo': ['resumo','resumos','resumir','resumindo','sintese','sintetizar','sinteses'],
  'escrita': ['escrita','escrever','redacao','redigir','reescrever','textos','texto'],
  'revisão': ['revisao','revisoes','revisar','corrigir','correcao','correcoes','gramatica','ortografia'],
  'busca': ['busca','buscas','buscar','pesquisar','pesquisa','pesquisas','procurar','encontrar'],
  'leitura': ['leitura','leituras','ler'],
  'ideias': ['ideia','ideias','brainstorm','brainstorming','criatividade'],
  'explicação': ['explicacao','explicacoes','explicar','entender','compreender','entendimento','compreensao'],
  'referências': ['referencia','referencias','bibliografia','bibliografias','citacao','citacoes'],
  'fontes': ['fonte','fontes','artigo','artigos'],
  'verificação': ['verificacao','verificar','conferencia','conferir','checagem','checar','validacao','validar','confirmar'],
  'erros': ['erro','erros','errado','errada','incorreto','incorreta','alucinacao','alucinacoes','inventou','inventar','inventa'],
  'organização': ['organizacao','organizar','organizando','estrutura','estruturar'],
  'tradução': ['traducao','traducoes','traduzir','traduzindo'],
  'agilidade': ['agilidade','rapidez','rapido','rapida','velocidade','tempo','produtividade'],
  'dados': ['dado','dados','estatistica','estatisticas','numeros'],
  'aprendizado': ['aprendizado','aprendizagem','aprender','estudar','estudo','estudos'],
  'código': ['codigo','codigos','programacao','programar'],
  'ChatGPT': ['chatgpt','gpt'], 'Claude':['claude'], 'Gemini':['gemini'], 'DeepSeek':['deepseek'],
  'confiança': ['confianca','confiar','confiavel','confiaveis'], 'clareza':['clareza','claro','clara'],
};
const STOP = new Set(('a o as os um uma uns umas e em de da do das dos na no nas nos que com para por pelo pela pelos pelas eu me meu minha meus minhas voce voces se ao aos foi foram fez fazer fiz usei usar uso usou ia inteligencia artificial ajudou ajuda ajudaram ajuda muito mais menos pouco bem bom boa tive tinha tenho tem ter ser era ainda nao sim precisei precisou preciso depois antes isso isto esse essa esses essas ele ela eles elas mas porem tambem ja so ate como quando qual quais tudo sobre consegui consigo conseguir principalmente vezes vez').split(' '));
export function normalize(s:string) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
const CANONICAL = new Map(Object.entries(SYNONYMS).flatMap(([key,words])=>words.map(w=>[w,key] as const)));
export function extractTerms(experience:string) {
  const out = new Map<string,Set<string>>();
  for (const word of experience.match(/[\p{L}\p{N}]+/gu) || []) {
    const clean=normalize(word); if(clean.length<3 || STOP.has(clean) || /^\d+$/.test(clean)) continue;
    const label=CANONICAL.get(clean) || clean;
    if(!out.has(label)) out.set(label,new Set()); out.get(label)!.add(word.toLowerCase());
  }
  return [...out].slice(0,18).map(([label,variants])=>({label,variants:[...variants]}));
}
export function aggregateWords(experiences:string[]) {
 const map=new Map<string,{label:string,count:number,variants:Set<string>}>();
 for(const experience of experiences) for(const term of extractTerms(experience)) {
   const item=map.get(term.label)||{label:term.label,count:0,variants:new Set<string>()};
   item.count++;term.variants.forEach(v=>item.variants.add(v));map.set(term.label,item);
 }
 return [...map.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR')).slice(0,28).map(v=>({...v,variants:[...v.variants]}));
}
