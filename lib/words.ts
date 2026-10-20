// Local Portuguese vocabulary and clause rules: no external service receives responses.
// Counts represent people who mention a concept affirmatively, not repeated tokens.
export const SYNONYMS: Record<string, string[]> = {
  'resumo': ['resumo', 'resumos', 'resumir', 'resumindo', 'resumi', 'sintese', 'sintetizar', 'sinteses'],
  'escrita': ['escrita', 'escrever', 'redacao', 'redigir', 'reescrever', 'textos', 'texto'],
  'revisão': ['revisao', 'revisoes', 'revisar', 'revisei', 'corrigir', 'correcao', 'correcoes', 'gramatica', 'ortografia'],
  'busca': ['busca', 'buscas', 'buscar', 'pesquisar', 'pesquisa', 'pesquisas', 'procurar', 'encontrar'],
  'leitura': ['leitura', 'leituras', 'ler', 'li'],
  'ideias': ['ideia', 'ideias', 'brainstorm', 'brainstorming', 'criatividade'],
  'explicação': ['explicacao', 'explicacoes', 'explicar', 'entender', 'compreender', 'entendimento', 'compreensao'],
  'referências': ['referencia', 'referencias', 'bibliografia', 'bibliografias', 'citacao', 'citacoes', 'citar'],
  'fontes': ['fonte', 'fontes', 'artigo', 'artigos'],
  'verificação': ['verificacao', 'verificar', 'conferencia', 'conferir', 'checagem', 'checar', 'validacao', 'validar', 'confirmar'],
  'erros': ['erro', 'erros', 'errado', 'errada', 'incorreto', 'incorreta', 'alucinacao', 'alucinacoes', 'inventou', 'inventar', 'inventa'],
  'organização': ['organizacao', 'organizar', 'organizando', 'estrutura', 'estruturar'],
  'tradução': ['traducao', 'traducoes', 'traduzir', 'traduzindo'],
  'agilidade': ['agilidade', 'rapidez', 'rapido', 'rapida', 'velocidade', 'tempo', 'produtividade'],
  'dados': ['dado', 'dados', 'estatistica', 'estatisticas', 'numeros'],
  'aprendizado': ['aprendizado', 'aprendizagem', 'aprender', 'estudar', 'estudo', 'estudos'],
  'código': ['codigo', 'codigos', 'programacao', 'programar'],
  'planilhas': ['planilha', 'planilhas'],
  'apresentações': ['apresentacao', 'apresentacoes', 'slides'],
  'imagens': ['imagem', 'imagens', 'ilustracao', 'ilustracoes'],
  'privacidade': ['privacidade', 'confidencialidade'],
  'confiança': ['confianca', 'confiar', 'confiavel', 'confiaveis'],
  'clareza': ['clareza', 'claro', 'clara'],
  'ChatGPT': ['chatgpt', 'gpt', 'chat gpt'],
  'Codex': ['codex'],
  'Claude': ['claude'],
  'Gemini': ['gemini', 'google gemini'],
  'Copilot': ['copilot', 'microsoft copilot'],
  'Qwen': ['qwen'],
  'GLM': ['glm'],
  'DeepSeek': ['deepseek', 'deep seek'],
  'Google Acadêmico': ['google academico', 'google scholar'],
  'Semantic Scholar': ['semantic scholar'],
  'NotebookLM': ['notebooklm', 'notebook lm'],
  'Zotero': ['zotero'],
  'ResearchRabbit': ['researchrabbit', 'research rabbit'],
};

export function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const STOP = new Set((
  'a o as os um uma uns umas e ou em de da do das dos na no nas nos que com para por pelo pela pelos pelas ' +
  'eu me meu minha meus minhas voce voces nos nosso nossa nossos nossas se ao aos foi foram fez fazer fiz ' +
  'usei usar uso usos usa usam usou usado utilizada utilizado utilizar utilizo utilizei utilizada utilizando usando ' +
  'ia inteligencia artificial ajudou ajuda ajudaram ajudar auxilia auxilio auxilia ajuda ' +
  'muito muita muitos muitas mais menos pouco pouca poucos poucas bem bom boa boas bons ' +
  'tive tinha tenho tem ter ser era sou sera sido ainda nao nem nunca jamais sem nenhum nenhuma nada sim ' +
  'precisei precisou preciso precisar depois antes isso isto esse essa esses essas ele ela eles elas ' +
  'mas porem contudo entretanto tambem ja so apenas somente ate como quando qual quais tudo sobre ' +
  'consegui consigo conseguir consegue principalmente vezes vez sempre geralmente normalmente ' +
  'costumo costumava gosto gostei gostar prefiro preferi observo observar passou funciona funcionou consigo ' +
  'foi achei acho achar deu da desde porque pois entao assim ali aqui la ate ate mesmo ' +
  'experiencia experiencias ferramenta ferramentas tarefa tarefas coisa coisas parte tipo exemplo ' +
  'realmente bastante tanto tanta todos todas algum alguma alguns algumas outro outra outros outras ' +
  'pode podem poderia podia quero queria vou vai fui estou esta estao estava seja fosse mesmo mesma ' +
  'cada durante atraves agora hoje ontem ainda entendi tive existe tudo precisa necessidade universidade ' +
  'plataforma plataformas modelo modelos versao versoes'
).split(/\s+/));

const NEGATORS = new Set(['nao', 'nem', 'nunca', 'jamais', 'sem', 'nenhum', 'nenhuma']);
const CONTRAST = new Set(['mas', 'porem', 'contudo', 'entretanto']);
const PREDICATES = new Set([
  'uso', 'usei', 'utilizo', 'utilizei', 'prefiro', 'preferi', 'gosto', 'gostei', 'costumo',
  'consigo', 'consegui', 'ajuda', 'ajudou', 'quero', 'queria', 'escrevo', 'escrevi',
]);
const LEAD_INS = new Set(['eu', 'tambem', 'ja', 'sempre', 'geralmente', 'normalmente', 'so']);
const CANONICAL = new Map(Object.entries(SYNONYMS).flatMap(([label, variants]) =>
  variants.map(variant => [normalize(variant), label] as const)));

type Token = { raw: string; clean: string };
type Mention = { label: string; variant: string; negated: boolean };

function hasAffirmativePredicate(tokens: Token[], from: number) {
  let index = from;
  while (index < tokens.length && LEAD_INS.has(tokens[index].clean)) index++;
  return PREDICATES.has(tokens[index]?.clean);
}

function isNegative(token: Token | undefined) {
  return token !== undefined && NEGATORS.has(token.clean);
}

export function extractTerms(experience: string) {
  // Keep clause boundaries; discarding "não" before tokenizing would reverse its meaning.
  const tokens: Token[] = (experience.match(/\d+(?:\.\d+)+|[\p{L}\p{N}]+|[,.;:!?\n]/gu) || [])
    .map(raw => ({ raw, clean: normalize(raw) }));
  const mentions: Mention[] = [];
  let negated = false;
  let clauseStart = 0;

  for (let index = 0; index < tokens.length; index++) {
    const { clean, raw } = tokens[index];
    if (/^[,.;:!?\n]$/.test(clean) || CONTRAST.has(clean)) {
      // Commas may continue a negative list: "Não uso Claude, Gemini ou Qwen".
      const following = tokens.slice(index + 1).findIndex(token => /^[,.;:!?\n]$/.test(token.clean));
      const nextClause = tokens.slice(index + 1, following < 0 ? undefined : index + 1 + following);
      const explicitlyPositive = hasAffirmativePredicate(tokens, index + 1) || nextClause.some(token => token.clean === 'sim');
      if (clean !== ',' || explicitlyPositive) negated = false;
      clauseStart = mentions.length;
      continue;
    }
    if (clean === 'e') {
      // A new explicit predicate starts a new assertion: "não uso X e uso Y".
      // A negative assertion after "e também" must not negate an earlier mention.
      if (hasAffirmativePredicate(tokens, index + 1)) negated = false;
      clauseStart = mentions.length;
      continue;
    }
    if (isNegative(tokens[index])) {
      // "Não só/apenas X, mas também Y" affirms both names.
      const onlyIndex = PREDICATES.has(tokens[index + 1]?.clean) ? index + 2 : index + 1;
      if (clean === 'nao' && ['so', 'apenas', 'somente'].includes(tokens[onlyIndex]?.clean)) continue;
      // Handle topicalized answers such as "Claude eu não uso" and "Claude não".
      const next = tokens[index + 1];
      if (clean === 'nao' && (!next || /^[,.;:!?\n]$/.test(next.clean) || hasAffirmativePredicate(tokens, index + 1))) {
        const previous = mentions.at(-1);
        const recentWords = tokens.slice(Math.max(0, index - 3), index).map(token => token.clean);
        if (previous && mentions.length > clauseStart && !recentWords.some(word => PREDICATES.has(word))) {
          previous.negated = true;
        }
      }
      negated = true;
      continue;
    }

    // Prefer the longest known expression, e.g. "Google Acadêmico" or "Chat GPT".
    let label: string | undefined;
    let variant = raw;
    for (const size of [3, 2, 1]) {
      const chunk = tokens.slice(index, index + size);
      if (chunk.length !== size || chunk.some(token => /^[,.;:!?\n]$/.test(token.clean))) continue;
      const match = CANONICAL.get(chunk.map(token => token.clean).join(' '));
      if (match) {
        label = match;
        variant = chunk.map(token => token.raw).join(' ');
        index += size - 1;
        break;
      }
    }

    if (!label) {
      if (clean.length < 3 || STOP.has(clean) || /^\d+(?:\.\d+)*$/.test(clean)) continue;
      label = clean;
    }
    mentions.push({ label, variant: variant.toLocaleLowerCase('pt-BR'), negated });
  }

  const out = new Map<string, Set<string>>();
  for (const mention of mentions) {
    if (mention.negated) continue;
    if (!out.has(mention.label)) out.set(mention.label, new Set());
    out.get(mention.label)!.add(mention.variant);
  }
  // Known topics survive a long response before less informative unknown terms.
  return [...out].sort(([a], [b]) => Number(!SYNONYMS[a]) - Number(!SYNONYMS[b]))
    .slice(0, 18).map(([label, variants]) => ({ label, variants: [...variants] }));
}

export function aggregateWords(experiences: string[]) {
  const map = new Map<string, { label: string; count: number; variants: Set<string> }>();
  for (const experience of experiences) {
    for (const term of extractTerms(experience)) {
      const item = map.get(term.label) || { label: term.label, count: 0, variants: new Set<string>() };
      item.count++;
      term.variants.forEach(variant => item.variants.add(variant));
      map.set(term.label, item);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, 28).map(item => ({ ...item, variants: [...item.variants] }));
}
