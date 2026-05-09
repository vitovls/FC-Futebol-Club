# Tasks — TFC Revival

**Data:** 2026-05-09
**Spec:** [../superpowers/specs/2026-05-09-tfc-revival-design.md](../superpowers/specs/2026-05-09-tfc-revival-design.md)
**Status:** Pendente implementação

---

## Subagente 1 — Infraestrutura Docker + Backend

### TASK-001 — Atualizar Dockerfile do backend para Node 20

**Arquivo:** `app/backend/Dockerfile`
**Mudança:** `node:16-alpine` → `node:20-alpine`
**Verificação:** `docker build ./app/backend` sem erros

---

### TASK-002 — Corrigir healthchecks no docker-compose.yml

**Arquivo:** `app/docker-compose.yml`
**Mudanças:**
- Backend healthcheck: `["CMD", "wget", "-qO-", "http://localhost:3001/health"]`
- Frontend healthcheck: `["CMD", "wget", "-qO-", "http://localhost:3000"]`
**Verificação:** `docker compose up` mostra serviços como `healthy`

---

### TASK-003 — Adicionar rota GET /health no backend

**Arquivo:** `app/backend/src/routes/` (novo arquivo ou adição ao existente)
**Mudança:** Nova rota mínima `GET /health → 200 { status: 'ok' }`
**Verificação:** `curl http://localhost:3001/health` retorna 200

---

## Subagente 2 — Migração Vite

### TASK-004 — Atualizar Dockerfile do frontend para Node 20 + Vite

**Arquivo:** `app/frontend/Dockerfile`
**Mudanças:**
- `node:16-alpine` → `node:20-alpine`
- Adicionar `EXPOSE 3000`
- CMD: `["npm", "run", "dev", "--", "--host"]`
**Verificação:** Imagem builda e container expõe porta 3000

---

### TASK-005 — Migrar package.json do frontend para Vite

**Arquivo:** `app/frontend/package.json`
**Mudanças:**
- Remover: `react-scripts`, `eslint-config-trybe-frontend`
- Adicionar: `vite@^5`, `@vitejs/plugin-react@^4`
- Scripts: `start: vite`, `build: vite build`, `preview: vite preview`
- Remover script `eject`
**Verificação:** `npm install` sem erros

---

### TASK-006 — Criar vite.config.ts

**Arquivo:** `app/frontend/vite.config.ts` (novo)
**Conteúdo:**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
});
```
**Verificação:** `vite` inicia na porta 3000

---

### TASK-007 — Migrar index.html para raiz do frontend

**Origem:** `app/frontend/public/index.html`
**Destino:** `app/frontend/index.html`
**Mudanças:**
- Remover `%PUBLIC_URL%` das referências
- Adicionar antes de `</body>`: `<script type="module" src="/src/index.js"></script>`
**Verificação:** Frontend renderiza no browser sem erro 404

---

### TASK-008 — Verificar variáveis de ambiente REACT_APP_*

**Arquivos:** `app/frontend/src/**`
**Ação:** Grep por `REACT_APP_` — se existir, renomear para `VITE_` e atualizar referências para `import.meta.env.VITE_*`
**Verificação:** Sem referências a `process.env.REACT_APP_` no código

---

## Verificação Final (ambos os subagentes)

### TASK-009 — Smoke test local

```bash
# Terminal 1
cd app && docker compose up db -d
cd app/backend && npm run dev

# Terminal 2
cd app/frontend && npm start
```

Verificar:
- [ ] Frontend abre em `http://localhost:3000`
- [ ] `curl http://localhost:3001/health` → 200
- [ ] `curl http://localhost:3001/clubs` → array de clubes

---

### TASK-010 — Smoke test Docker completo

```bash
npm run compose:up  # da raiz
```

Verificar:
- [ ] `docker compose ps` → 3 containers `healthy`
- [ ] `http://localhost:3000` abre no browser
- [ ] `curl http://localhost:3001/login` com body válido retorna JWT
- [ ] `curl http://localhost:3001/leaderboard` retorna classificação
