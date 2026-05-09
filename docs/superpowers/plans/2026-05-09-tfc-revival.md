# TFC Revival Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar o projeto TFC ao estado funcional em ambientes local e Docker, migrando o frontend de CRA para Vite e atualizando a infraestrutura Docker para Node 20 LTS.

**Architecture:** Dois subagentes paralelos sem sobreposição de arquivos. Subagente 1 cuida exclusivamente de Docker/backend; Subagente 2 cuida exclusivamente do frontend/Vite. Merge seguro ao final — nenhum arquivo é tocado por ambos.

**Tech Stack:** Node 20 LTS, Docker Compose v2, Vite 5, @vitejs/plugin-react 4, React 17, Express 4, TypeScript 4.4, Sequelize 6, MySQL 8, Mocha + Chai + Sinon (testes backend).

---

## Mapa de Arquivos

### Subagente 1 — Docker/Backend

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `app/backend/Dockerfile` | Modificar | Atualizar runtime Node 16 → 20 |
| `app/docker-compose.yml` | Modificar | Corrigir healthchecks (lsof → wget) |
| `app/backend/src/routes/index.ts` | Modificar | Adicionar rota GET /health |
| `app/backend/src/tests/00.health.test.ts` | Criar | Teste TDD da rota /health |

### Subagente 2 — Vite Migration

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `app/frontend/Dockerfile` | Modificar | Node 16 → 20, CMD para Vite com --host |
| `app/frontend/package.json` | Modificar | Trocar react-scripts por vite + plugin-react |
| `app/frontend/vite.config.ts` | Criar | Config Vite: porta 3000, host: true |
| `app/frontend/index.html` | Criar | index.html na raiz (movido de public/) |
| `app/frontend/src/services/requests.js` | Modificar | REACT_APP_API_PORT → VITE_API_PORT |

---

## FRENTE 1 — Docker / Backend
*Execute em: `app/backend/` e `app/` (para docker-compose)*

---

### Task 1: Atualizar Dockerfile do backend para Node 20

**Arquivos:**
- Modificar: `app/backend/Dockerfile`

- [ ] **Passo 1: Editar Dockerfile**

Substituir o conteúdo completo de `app/backend/Dockerfile` por:

```dockerfile
FROM node:20-alpine

WORKDIR /usr/app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

- [ ] **Passo 2: Verificar que a imagem builda**

```bash
cd app/backend
docker build -t tfc-backend-test .
```

Esperado: `Successfully built <id>` (pode demorar 1-2 min na primeira vez)

- [ ] **Passo 3: Limpar imagem de teste e commitar**

```bash
docker rmi tfc-backend-test
git add app/backend/Dockerfile
git commit -m "chore: update backend Dockerfile to node:20-alpine"
```

---

### Task 2: Corrigir healthchecks no docker-compose.yml

**Contexto:** `lsof` não existe em imagens alpine. `wget` está disponível por padrão.

**Arquivo:**
- Modificar: `app/docker-compose.yml`

- [ ] **Passo 1: Editar docker-compose.yml**

Substituir o conteúdo completo de `app/docker-compose.yml` por:

```yaml
version: '3.9'
services:
  frontend:
    build: ./frontend
    ports:
      - 3000:3000
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000"]
      timeout: 10s
      retries: 5
  backend:
    container_name: app_backend
    build: ./backend
    ports:
      - 3001:3001
    depends_on:
      db:
        condition: service_healthy
    environment:
      - PORT=3001
      - DB_USER=root
      - DB_PASS=123456
      - DB_HOST=db
      - DB_NAME=TRYBE_FUTEBOL_CLUBE
      - DB_PORT=3306
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
      timeout: 10s
      retries: 5
  db:
    image: mysql:8.0.21
    container_name: db
    ports:
      - 3002:3306
    environment:
      - MYSQL_ROOT_PASSWORD=123456
    restart: 'always'
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 10s
      retries: 5
    cap_add:
      - SYS_NICE
```

- [ ] **Passo 2: Validar sintaxe**

```bash
cd app
docker compose config
```

Esperado: YAML impresso sem erros de parse.

- [ ] **Passo 3: Commitar**

```bash
git add app/docker-compose.yml
git commit -m "fix: replace lsof with wget in docker-compose healthchecks"
```

---

### Task 3: Adicionar rota GET /health (TDD)

**Contexto:** O backend usa Express + TypeScript. As rotas ficam em `app/backend/src/routes/index.ts`. Os testes usam mocha + chai-http e importam `app` de `../app`.

**Arquivos:**
- Criar: `app/backend/src/tests/00.health.test.ts`
- Modificar: `app/backend/src/routes/index.ts`

- [ ] **Passo 1: Escrever o teste que falha**

Criar `app/backend/src/tests/00.health.test.ts`:

```typescript
import * as chai from 'chai';
// @ts-ignore
import chaiHttp = require('chai-http');
import { app } from '../app';

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /health', () => {
  it('retorna status 200 com { status: "ok" }', async () => {
    const res = await chai.request(app).get('/health');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ status: 'ok' });
  });
});
```

- [ ] **Passo 2: Rodar o teste — confirmar que falha**

```bash
cd app/backend
npx mocha -r ts-node/register ./src/tests/00.health.test.ts -t 10000 --exit
```

Esperado: `1 failing` com erro `404 Not Found` ou similar.

- [ ] **Passo 3: Adicionar a rota em routes/index.ts**

Editar `app/backend/src/routes/index.ts`. O arquivo atual:

```typescript
import { Router } from 'express';
import clubsRoutes from './clubs';
import leaderboardsRoutes from './leaderboards';
import loginRoutes from './login';
import matchsRoute from './matchs';

const routes = Router();

routes.use('/clubs', clubsRoutes);
routes.use('/login', loginRoutes);
routes.use('/matchs', matchsRoute);
routes.use('/leaderboard', leaderboardsRoutes);

export default routes;
```

Após a edição:

```typescript
import { Router } from 'express';
import clubsRoutes from './clubs';
import leaderboardsRoutes from './leaderboards';
import loginRoutes from './login';
import matchsRoute from './matchs';

const routes = Router();

routes.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

routes.use('/clubs', clubsRoutes);
routes.use('/login', loginRoutes);
routes.use('/matchs', matchsRoute);
routes.use('/leaderboard', leaderboardsRoutes);

export default routes;
```

- [ ] **Passo 4: Rodar o teste — confirmar que passa**

```bash
cd app/backend
npx mocha -r ts-node/register ./src/tests/00.health.test.ts -t 10000 --exit
```

Esperado: `1 passing`

- [ ] **Passo 5: Rodar toda a suite de testes — confirmar que nada quebrou**

```bash
cd app/backend
npm test
```

Esperado: todos os testes passando (incluindo os arquivos 01 a 05).

- [ ] **Passo 6: Commitar**

```bash
git add app/backend/src/tests/00.health.test.ts app/backend/src/routes/index.ts
git commit -m "feat: add GET /health endpoint with TDD"
```

---

## FRENTE 2 — Vite Migration
*Execute em: `app/frontend/`*

---

### Task 4: Atualizar Dockerfile do frontend para Node 20 + Vite

**Arquivo:**
- Modificar: `app/frontend/Dockerfile`

- [ ] **Passo 1: Editar Dockerfile**

Substituir o conteúdo completo de `app/frontend/Dockerfile` por:

```dockerfile
FROM node:20-alpine

WORKDIR /usr/app/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
```

**Por que `--host`:** O Vite por padrão escuta só em `127.0.0.1`. Dentro de um container, o healthcheck e o Docker precisam acessar via `0.0.0.0` — o flag `--host` habilita isso.

- [ ] **Passo 2: Commitar**

```bash
git add app/frontend/Dockerfile
git commit -m "chore: update frontend Dockerfile to node:20-alpine with vite --host"
```

---

### Task 5: Migrar package.json do frontend de CRA para Vite

**Arquivo:**
- Modificar: `app/frontend/package.json`

- [ ] **Passo 1: Substituir package.json**

Substituir o conteúdo completo de `app/frontend/package.json` por:

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "5.15.0",
    "@testing-library/react": "11.2.7",
    "@testing-library/user-event": "12.8.3",
    "@vitejs/plugin-react": "^4.0.0",
    "axios": "0.24.0",
    "react": "17.0.2",
    "react-dom": "17.0.2",
    "react-router-dom": "6.0.2",
    "vite": "^5.0.0",
    "web-vitals": "1.1.2"
  },
  "scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

**O que foi removido:** `react-scripts`, `eslint-config-trybe-frontend`, `eslint-plugin-sonarjs`, `stylelint`, `stylelint-order`, `jest` (esses eram deps do CRA).

- [ ] **Passo 2: Instalar as dependências**

```bash
cd app/frontend
rm -rf node_modules package-lock.json
npm install
```

Esperado: instalação sem erros fatais. Warnings são aceitáveis.

- [ ] **Passo 3: Commitar**

```bash
git add app/frontend/package.json app/frontend/package-lock.json
git commit -m "chore: migrate frontend from react-scripts to vite 5"
```

---

### Task 6: Criar vite.config.ts

**Arquivo:**
- Criar: `app/frontend/vite.config.ts`

- [ ] **Passo 1: Criar o arquivo**

Criar `app/frontend/vite.config.ts` com o conteúdo:

```typescript
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

**Por que `host: true`:** Equivalente ao `--host` no CMD do Dockerfile. Garante que o servidor escuta em `0.0.0.0` para ser acessível dentro e fora do container. A porta 3000 mantém compatibilidade com o docker-compose existente.

- [ ] **Passo 2: Commitar**

```bash
git add app/frontend/vite.config.ts
git commit -m "chore: add vite.config.ts with port 3000 and host: true"
```

---

### Task 7: Criar index.html na raiz do frontend

**Contexto:** No CRA, o `index.html` ficava em `public/` e o bundle era injetado automaticamente. No Vite, o `index.html` fica na raiz do projeto e referencia o entry point via `<script type="module">`. O `public/` continua existindo para assets estáticos.

**Arquivo:**
- Criar: `app/frontend/index.html`

- [ ] **Passo 1: Criar app/frontend/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="TFC - Trybe Futebol Clube" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <title>TFC</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

**Diferenças em relação ao public/index.html original:**
- `%PUBLIC_URL%/favicon.ico` → `/favicon.ico` (Vite serve `public/` automaticamente na raiz)
- `%PUBLIC_URL%/logo192.png` → `/logo192.png`
- Adicionada a tag `<script type="module" src="/src/index.js"></script>` (obrigatório no Vite)

- [ ] **Passo 2: Commitar**

```bash
git add app/frontend/index.html
git commit -m "chore: add vite-compatible index.html to frontend root"
```

---

### Task 8: Migrar variável de ambiente REACT_APP_API_PORT → VITE_API_PORT

**Contexto:** O CRA expõe variáveis prefixadas com `REACT_APP_` via `process.env`. O Vite expõe variáveis prefixadas com `VITE_` via `import.meta.env`. O arquivo afetado é `app/frontend/src/services/requests.js`.

**Arquivo:**
- Modificar: `app/frontend/src/services/requests.js`

- [ ] **Passo 1: Verificar o arquivo atual**

Ler `app/frontend/src/services/requests.js`. A linha atual é:

```javascript
baseURL: `http://localhost:${process.env.REACT_APP_API_PORT || '3001'}`,
```

- [ ] **Passo 2: Substituir a referência**

Editar a linha para:

```javascript
baseURL: `http://localhost:${import.meta.env.VITE_API_PORT || '3001'}`,
```

**Nota:** O fallback `'3001'` garante que o app funciona mesmo sem a variável definida — comportamento correto para o projeto.

- [ ] **Passo 3: Confirmar que não há outras referências a REACT_APP_**

```bash
grep -r "REACT_APP_" app/frontend/src/
```

Esperado: nenhuma saída (zero ocorrências).

- [ ] **Passo 4: Commitar**

```bash
git add app/frontend/src/services/requests.js
git commit -m "fix: migrate REACT_APP_API_PORT to VITE_API_PORT (import.meta.env)"
```

---

## VERIFICAÇÃO FINAL
*Execute após ambas as frentes concluídas*

---

### Task 9: Smoke test local

**Pré-requisito:** Banco de dados disponível. Subir apenas o container `db`:

```bash
cd app
docker compose up db -d
```

Aguardar o container ficar healthy:

```bash
docker compose ps
```

Esperado: `db` com status `healthy`.

- [ ] **Passo 1: Testar backend local**

```bash
cd app/backend
export PORT=3001
export DB_USER=root
export DB_PASS=123456
export DB_NAME=TRYBE_FUTEBOL_CLUBE
export DB_HOST=localhost
export DB_PORT=3306

npm run dev
```

Em outro terminal:

```bash
curl http://localhost:3001/health
```

Esperado: `{"status":"ok"}`

```bash
curl http://localhost:3001/clubs
```

Esperado: array JSON com os clubes (ex: `[{"id":1,"clubName":"Avaí/Kindermann"}, ...]`)

- [ ] **Passo 2: Testar frontend local**

```bash
cd app/frontend
npm start
```

Esperado: mensagem do Vite com `Local: http://localhost:3000/`. Abrir no browser — a UI deve renderizar sem erros no console.

- [ ] **Passo 3: Parar os serviços locais e o container db**

```bash
cd app
docker compose down
```

---

### Task 10: Smoke test Docker completo

- [ ] **Passo 1: Subir a stack completa**

```bash
# Da raiz do projeto
npm run compose:up
```

Aguardar o build (pode levar 2-5 minutos na primeira vez).

- [ ] **Passo 2: Verificar containers healthy**

```bash
cd app && docker compose ps
```

Esperado: os 3 serviços (`frontend`, `app_backend`, `db`) com status `healthy`.

- [ ] **Passo 3: Verificar endpoints**

```bash
# Saúde do backend
curl http://localhost:3001/health
# Esperado: {"status":"ok"}

# Clubes
curl http://localhost:3001/clubs
# Esperado: array de clubes

# Partidas
curl http://localhost:3001/matchs
# Esperado: array de partidas

# Leaderboard geral
curl http://localhost:3001/leaderboard
# Esperado: array de times ordenado por pontos
```

- [ ] **Passo 4: Verificar frontend no browser**

Abrir `http://localhost:3000`. A UI do TFC deve carregar. Fazer login com as credenciais padrão do seed (usuário admin: `admin@admin.com` / senha: `secret_admin`).

- [ ] **Passo 5: Commitar estado final se necessário**

```bash
git add -A
git status  # confirmar que não há arquivos não-rastreados relevantes
git commit -m "chore: tfc revival complete - local and docker environments working"
```

---

## Referências

- [Design Spec](../specs/2026-05-09-tfc-revival-design.md)
- [Tasks](../../tasks/2026-05-09-tfc-revival-tasks.md)
- [PRD](../../prd/2026-05-09-tfc-revival-prd.md)
- [SRD](../../srd/2026-05-09-tfc-revival-srd.md)
- [ADR-001 Node 20](../../adr/ADR-001-node-20-lts.md)
- [ADR-002 Vite](../../adr/ADR-002-vite-migration.md)
- [ADR-003 docker compose](../../adr/ADR-003-docker-compose-plugin.md)
