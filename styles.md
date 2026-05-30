# Guia visual do Polaris Frontend

## Stack e estrutura

- Aplicacao em Vue 3 com TypeScript, usando componentes em `script setup`.
- Estilizacao com Tailwind CSS e tokens definidos em `tailwind.config.js`.
- Imports relativos entre arquivos; o projeto nao usa alias de caminho.
- Tipos compartilhados vivem em `src/types`.
- Icones sao fornecidos por `lucide-vue-next`.

## Tema

- A interface usa tema escuro como padrao.
- Cores principais:
  - `bg`: fundo geral.
  - `surface`: superficies secundarias.
  - `card`: cards e blocos de conteudo.
  - `border`: bordas.
  - `accent` e `accent-hover`: chamadas de atencao e destaques.
  - `text-primary`, `text-secondary` e `text-muted`: hierarquia de texto.

## Componentes e layout

- Cards usam `bg-card`, `border-2`, `border-border`, `rounded-md` e espacamento interno com `p-*`.
- Layouts preferem `flex` ou `grid` com `gap-*` para ritmo visual.
- Estados interativos mantem transicoes curtas, como `transition duration-150`.
- Cards clicaveis ou acionaveis podem destacar `hover:border-accent`.
- Elementos de status e categoria aparecem como badges compactas, com texto pequeno e peso semibold.

## Convencoes de UI

- Componentes devem permanecer simples e proximos do dado que exibem.
- Preservar o contraste do tema escuro e evitar novas paletas fora dos tokens, exceto quando a cor vier do backend.
- Usar bordas e radius moderados; o padrao atual e `rounded-md`.
- Manter textos curtos e escaneaveis, com capitalizacao coerente com o contexto.
