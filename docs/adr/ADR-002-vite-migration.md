# ADR-002 — Migrar Frontend de CRA para Vite

**Data:** 2026-05-09
**Status:** Aceito
**Decisores:** Victor Veloso

---

## Contexto

O frontend usa `react-scripts` 4.0.3 (Create React App). Este toolchain:

- É incompatível com Node 18+ sem workaround `NODE_OPTIONS=--openssl-legacy-provider`
- Foi descontinuado pelo time do React em 2023
- Usa Webpack internamente, resultando em tempos de build/HMR significativamente maiores que alternativas modernas

Três opções foram avaliadas:
1. Workaround `--openssl-legacy-provider` — mantém CRA funcionando com Node 20, mas é tecnicamente uma dívida
2. Atualizar para `react-scripts` 5.x — compatível com Node 18+, mas ainda CRA descontinuado
3. Migrar para Vite 5 — ferramenta moderna, mantida, compatível com Node 20+

## Decisão

**Migrar para Vite 5** com `@vitejs/plugin-react`.

## Justificativa

- Elimina a raiz do problema (incompatibilidade OpenSSL) em vez de contorná-la
- Vite é a ferramenta recomendada pela documentação oficial do React desde 2023
- O código-fonte React (componentes, páginas, serviços) permanece 100% inalterado — a migração é apenas de toolchain
- HMR e tempo de cold start significativamente mais rápidos no desenvolvimento local
- Sem custo de manutenção futuro: CRA não recebe mais atualizações

## Consequências

- `index.html` precisa ser movido de `public/` para a raiz do projeto frontend
- Scripts `start`, `build`, `test` do `package.json` atualizados
- Variáveis de ambiente `REACT_APP_*` → `VITE_*` (verificar e migrar se existirem)
- Arquivo `vite.config.ts` criado com porta 3000 e host: true para Docker
- `react-scripts` e `eslint-config-trybe-frontend` removidos do `package.json`
