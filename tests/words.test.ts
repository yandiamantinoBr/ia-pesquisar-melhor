import assert from 'node:assert/strict';
import test from 'node:test';
const { aggregateWords, extractTerms }: typeof import('../lib/words') =
  await import(new URL('../lib/words.ts', import.meta.url).href);

const labels = (text: string) => extractTerms(text).map(term => term.label);

test('negative tool mentions do not increase its count', () => {
  assert.deepEqual(labels('uso muito Codex e não uso nada o Claude'), ['Codex']);
  assert.deepEqual(labels('não uso Claude, uso Gemini'), ['Gemini']);
  assert.deepEqual(labels('Nunca usei IA'), []);
  assert.deepEqual(labels('Codex, mas não Claude nem Gemini'), ['Codex']);
  assert.deepEqual(labels('uso Codex e também não uso Claude'), ['Codex']);
  assert.deepEqual(labels('Não uso Codex, Claude ou Gemini'), []);
  assert.deepEqual(labels('não uso GLM-5.3 e Qwen'), []);
});

test('a positive clause after a negated clause is counted', () => {
  assert.deepEqual(labels('não uso Claude e uso Gemini'), ['Gemini']);
  assert.deepEqual(labels('não uso Claude; prefiro Codex para resumir'), ['Codex', 'resumo']);
  assert.deepEqual(labels('não uso Claude, nem Gemini; uso Qwen'), ['Qwen']);
  assert.deepEqual(labels('não uso apenas Codex, mas também Gemini'), ['Codex', 'Gemini']);
  assert.deepEqual(labels('não uso Claude, Gemini sim'), ['Gemini']);
});

test('short lists preserve names, phrases and display capitalization', () => {
  assert.deepEqual(labels('Codex, Qwen, GLM 5.3, Copilot'), ['Codex', 'Qwen', 'GLM', 'Copilot']);
  assert.deepEqual(labels('Chat GPT; Google Acadêmico; Semantic Scholar; deep seek'),
    ['ChatGPT', 'Google Acadêmico', 'Semantic Scholar', 'DeepSeek']);
});

test('negation excludes the task as well as names and handles a topicalized answer', () => {
  assert.deepEqual(labels('Uso Codex para resumir, sem revisar'), ['Codex', 'resumo']);
  assert.deepEqual(labels('Claude eu não uso. Codex sim.'), ['Codex']);
  assert.deepEqual(labels('Claude não; Gemini sim'), ['Gemini']);
});

test('synonyms retain provenance and a participant contributes once per topic', () => {
  const words = aggregateWords([
    'Resumos, resumir e sínteses com Codex Codex',
    'Uso Codex para resumir. Não uso Claude.',
    'Revisar e corrigir a gramática',
  ]);
  assert.equal(words.find(word => word.label === 'resumo')?.count, 2);
  assert.equal(words.find(word => word.label === 'Codex')?.count, 2);
  assert.equal(words.find(word => word.label === 'revisão')?.count, 1);
  assert.equal(words.some(word => word.label === 'Claude'), false);
  assert.deepEqual(words.find(word => word.label === 'resumo')?.variants,
    ['resumos', 'resumir', 'sínteses']);
});

test('a sentence becomes relevant topics without filler and empty answers stay empty', () => {
  assert.deepEqual(labels('Eu usei o ChatGPT para resumir artigos e revisar o texto'),
    ['ChatGPT', 'resumo', 'fontes', 'revisão', 'escrita']);
  assert.deepEqual(labels('Ainda não utilizei nenhuma ferramenta'), []);
  assert.deepEqual(labels(''), []);
  assert.deepEqual(labels('123 5.3'), []);
});

test('affirmative and negative references to the same name count the positive evidence once', () => {
  assert.equal(aggregateWords(['Uso Codex, mas não uso Codex na escrita'])
    .find(word => word.label === 'Codex')?.count, 1);
});
