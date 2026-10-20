# IA para pesquisar melhor

Apresentação interativa de Yan Diamantino para a graduação em Administração.

- [Apresentação pública](https://ia-pesquisar-melhor-yan.yandiamantinobr.chatgpt.site)
- [PDF de consulta](https://ia-pesquisar-melhor-yan.yandiamantinobr.chatgpt.site/downloads/ia-pesquisar-melhor-v1.1.0.pdf)
- [Versões e downloads](https://github.com/yandiamantinoBr/ia-pesquisar-melhor/releases)

## Usar na aula

Abra a apresentação no computador e escolha **Controle pelo celular**. Escaneie o QR privado antes de projetar. O QR público do slide 4 recebe respostas anônimas. Só o controle privado pode trocar os slides ou pausar a enquete. A sessão dura sete dias.

Os alunos podem usar **Leitura** para consultar os slides em sequência ou **Baixar PDF** para guardar a edição de consulta. No celular, o modo leitura abre automaticamente. O PDF inclui ampliações, explicações, referências completas e créditos; não contém respostas da turma nem links de controle privado.

## Nuvem de palavras

Cada participante contribui no máximo uma vez por conceito. Reenviar atualiza o voto existente. Sinônimos, nomes compostos e negações comuns em português são tratados por regras locais: “uso Codex e não uso Claude” aumenta apenas Codex. O tamanho cresce com o número de pessoas que mencionam o termo. Não há cobrança nem envio das respostas a uma API de IA. Ironia, referências implícitas e negações complexas podem exigir revisão humana. O apresentador pode consultar os textos originais pelo controle privado.

## Versões

`v1.0.0` preserva o site originalmente publicado. `v1.1.0` contém a revisão de API/AGI, atividade, nuvem, leitura, referências e PDF. Cada release guarda o código daquele estado e seus arquivos de entrega. Para futuras alterações, mantenha versões numeradas e acrescente uma entrada em `CHANGELOG.md`.

## Desenvolvimento

Requer Node.js 24 ou superior, pnpm 11.25.0 e Git. Windows, macOS e Linux são suportados.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

A prévia inicia em `http://127.0.0.1:5173`. Para usar sessões na prévia, inicialize somente o banco local:

```sh
node tests/setup-local-db.mjs
node --test tests/words.test.ts
node tests/integration.mjs
pnpm build
```

O teste de API cria sessões locais de teste; nunca aponte esse teste para produção. A navegação real no navegador não pôde ser conferida nesta execução devido à restrição de acesso à origem local. O PDF foi conferido por renderização local, sem acessar serviços externos.

`app/` contém a apresentação e as rotas. `lib/references.json` registra a bibliografia e os créditos das imagens. `app/consulta/` e `scripts/render-pdf.mjs` geram a edição de consulta. O renderizador usa Playwright/Chromium como ferramenta de documento local, com as requisições de rede bloqueadas.

## Publicação e dados

O site usa Sites, Vinext e Cloudflare D1. O identificador de hospedagem está em `.openai/hosting.json`; ele não é uma credencial. Para publicar outra instalação, use seu próprio projeto e banco. A cópia no GitHub é o histórico público do código; enviar um commit ao GitHub não atualiza automaticamente o site hospedado.

Não publique `.env*`, `.git`, `.wrangler`, `.sites-runtime` nem dados de sessões. A edição pública contém somente código, imagens já usadas na apresentação e materiais de consulta. O banco de respostas não está neste repositório.

## Fontes e direitos

Os gráficos e exemplos de modelos são registros históricos de 07/10/2026, não um ranking atual. A bibliografia foi revista em 20/10/2026. O TCC é material fornecido pelo apresentador e seu repositório de origem tem acesso restrito. O registro de submissão ao ENGEMA e o trecho de manuscrito são materiais fornecidos, sem afirmar publicação ou aceite.

Logotipos, capturas e materiais de terceiros conservam seus direitos e créditos; a publicação do código não concede uma licença geral sobre essas imagens.
