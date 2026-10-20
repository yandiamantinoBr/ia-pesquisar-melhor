# IA para pesquisar melhor

Apresentação interativa de Yan Diamantino para a graduação em Administração.

- [Abrir a apresentação](https://ia-pesquisar-melhor-yan.yandiamantinobr.chatgpt.site)
- [Versões e arquivos para download](https://github.com/yandiamantinoBr/ia-pesquisar-melhor/releases)

## Versões

A versão `v1.0.0` preserva a primeira publicação, com 20 slides, imagens, referências, participação anônima da turma e controle dos slides pelo celular. O código foi recuperado do histórico do site (commit original `3b2772406b32c47a7320d0b37de9ac91853296d0`). O ZIP original acompanha a release para preservar os arquivos de origem integralmente.

Revisões posteriores terão versões numeradas e notas com as mudanças. O endereço do site apresenta a versão mais recente publicada; consulte as releases para versões anteriores.

## Desenvolvimento

Projeto React/TypeScript com Vinext, Vite e Cloudflare Workers. Requer Node.js compatível com `package.json` e pnpm. Instale as dependências e use `pnpm dev` para desenvolvimento ou `pnpm build` para gerar o site. A enquete e o controle remoto usam o binding D1 `DB`; cada implantação precisa de seu próprio banco e da aplicação das migrações em `drizzle/`. A configuração de hospedagem em `.openai/hosting.json` identifica o site original.

Credenciais, tokens de controle de sessões e respostas dos participantes não fazem parte deste repositório. Imagens, marcas e materiais citados mantêm os direitos de seus autores; esta publicação não concede licença sobre material de terceiros.
