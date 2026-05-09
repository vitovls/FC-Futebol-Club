# SRD — TFC Revival: System Requirements

**Data:** 2026-05-09
**Autor:** Victor Veloso
**Status:** Aprovado
**Referência:** [PRD TFC Revival](../prd/2026-05-09-tfc-revival-prd.md)

---

## 1. Requisitos de Runtime

| Componente | Versão | Justificativa |
|---|---|---|
| Node.js (local + Docker) | 20 LTS | Compatível com Vite 5, TypeScript 4, Sequelize 6; suporte até 2026 |
| Docker Compose | v2 (plugin) | `docker compose` — `docker-compose` standalone não disponível no WSL2 sem Docker Desktop ativo |
| MySQL | 8.0.21 | Versão já fixada no docker-compose; mantida sem alteração |
| Vite | 5.x | Substitui react-scripts 4.x; compatível com Node 20 e React 17 |
| TypeScript | 4.4.4 | Versão atual do backend; mantida |

---

## 2. Requisitos de Infraestrutura

### 2.1 docker-compose.yml

- Comando corrigido: `docker compose` (sem hífen)
- Healthchecks substituem `lsof` por `wget` (disponível em node:20-alpine)
- Topologia de serviços inalterada: `frontend → backend → db`
- Portas inalteradas: frontend 3000, backend 3001, db 3002→3306

### 2.2 Dockerfile — Frontend

```
FROM node:20-alpine
WORKDIR /usr/app/frontend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
```

- Vite precisa de `--host` para escutar em `0.0.0.0` dentro do container

### 2.3 Dockerfile — Backend

```
FROM node:20-alpine
WORKDIR /usr/app/backend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 3. Requisitos do Frontend

### 3.1 Migração CRA → Vite

| Item | CRA (atual) | Vite (novo) |
|---|---|---|
| Script dev | `react-scripts start` | `vite` |
| Script build | `react-scripts build` | `vite build` |
| `index.html` | `public/index.html` | `/index.html` (raiz) |
| Entry point | automático | `<script type="module" src="/src/index.js">` |
| Env vars | `REACT_APP_*` | `VITE_*` (se houver) |
| Porta padrão | 3000 | configurada para 3000 em `vite.config.ts` |

### 3.2 vite.config.ts

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

### 3.3 Dependências removidas

- `react-scripts`
- `eslint-config-trybe-frontend` (incompatível com Vite)

### 3.4 Dependências adicionadas

- `vite@^5`
- `@vitejs/plugin-react@^4`

---

## 4. Requisitos do Backend

### 4.1 Endpoint de Saúde

- `GET /health` → HTTP 200 `{ status: 'ok' }`
- Único arquivo novo: uma rota mínima adicionada ao router existente
- Não altera nenhuma rota, controller, service ou model existente

### 4.2 Compatibilidade Node 20

- TypeScript 4.4.4 compila sem alterações em Node 20
- Sequelize 6.9.0 + mysql2 2.3.3: compatíveis com Node 20
- `ts-node-dev` 1.1.8: compatível com Node 20

---

## 5. Requisitos de Desenvolvimento Local

### 5.1 Backend local

```bash
# Requer MySQL rodando (container db ou instância local)
cd app/backend
npm run dev  # ts-node-dev com DB_HOST=localhost DB_PORT=3306
```

Variáveis de ambiente necessárias (`.env` ou export):
```
PORT=3001
DB_USER=root
DB_PASS=123456
DB_NAME=TRYBE_FUTEBOL_CLUBE
DB_HOST=localhost
DB_PORT=3306
```

### 5.2 Frontend local

```bash
cd app/frontend
npm start  # vite --port 3000
```

---

## 6. Metodologia

- **SDD (Subagent-Driven Development)**: dois subagentes paralelos, sem sobreposição de arquivos
- **TDD**: testes escritos antes ou junto com cada mudança funcional
- Subagente 1: infraestrutura Docker + rota `/health`
- Subagente 2: migração Vite (frontend exclusivamente)
