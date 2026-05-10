# Design Spec — TFC Revival

**Data:** 2026-05-09
**Autor:** Victor Veloso
**Status:** Aprovado
**PRD:** [../prd/2026-05-09-tfc-revival-prd.md](../prd/2026-05-09-tfc-revival-prd.md)
**SRD:** [../srd/2026-05-09-tfc-revival-srd.md](../srd/2026-05-09-tfc-revival-srd.md)

---

## Problema

O projeto TFC está inoperante desde 2022. Os problemas são exclusivamente de infraestrutura e toolchain — o código de negócio está intacto.

Problemas identificados:
1. `docker-compose` (v1 standalone) não existe no WSL2 com Docker Desktop — apenas `docker compose` (v2 plugin)
2. Node 16 EOL nos Dockerfiles — sem patches de segurança
3. `react-scripts` 4.0.3 incompatível com Node 18+ (OpenSSL)
4. Healthchecks usam `lsof` — não disponível em node:alpine
5. Frontend Dockerfile não expõe porta

---

## Solução

Abordagem B — Paralela com SDD:

Dois subagentes trabalhando simultaneamente em frentes sem sobreposição de arquivos:

### Subagente 1 — Infraestrutura Docker + Backend

**Arquivos:**
- `app/backend/Dockerfile`
- `app/docker-compose.yml`
- `app/backend/src/routes/` (apenas adição de `/health`)

**Mudanças:**
- `node:16-alpine` → `node:20-alpine` no Dockerfile do backend
- Healthcheck do backend: `lsof` → `wget -qO- http://localhost:3001/health`
- Healthcheck do frontend: `lsof` → `wget -qO- http://localhost:3000`
- Adicionar rota `GET /health` → `{ status: 'ok' }` no backend

### Subagente 2 — Migração Vite

**Arquivos:**
- `app/frontend/Dockerfile`
- `app/frontend/package.json`
- `app/frontend/vite.config.ts` (novo)
- `app/frontend/index.html` (movido de `public/index.html`)

**Mudanças:**
- `node:16-alpine` → `node:20-alpine`
- CMD: `npm start` → `npm run dev -- --host`
- Remover `react-scripts`, adicionar `vite@^5` + `@vitejs/plugin-react@^4`
- Scripts: `start: vite`, `build: vite build`
- Criar `vite.config.ts` com port 3000 e host: true
- Mover e adaptar `index.html`
- Verificar e migrar variáveis `REACT_APP_*` → `VITE_*`

---

## Arquitetura — O que não muda

```
frontend (port 3000)
    ↓ axios calls
backend (port 3001)
    ↓ Sequelize ORM
db MySQL (port 3002→3306)
```

Código de negócio 100% preservado:
- Routes, controllers, services, models do backend
- Components, pages, services do frontend
- Schema, migrations, seeds do banco

---

## TDD

- Backend: testes mocha/chai/sinon existentes devem continuar passando após a adição do `/health`
- Frontend: sem testes novos nesta fase (a migration Vite não altera lógica)
- Critério de aceite verificado manualmente: containers `healthy`, endpoints funcionais

---

## Metodologia

- **SDD** (Subagent-Driven Development): tarefas paralelas e independentes
- Sem worktrees — mudanças são em arquivos completamente distintos, sem risco de conflito

---

## Próximos Passos (pós-revival)

Registrar como issues/ADRs futuros:
- Atualizar dependências do backend (Express 4 → 5, Sequelize 6 → 7)
- Adicionar CI/CD (GitHub Actions)
- Implementar testes E2E com Playwright
- Considerar migração para React 18 com Vite
