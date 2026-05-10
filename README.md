<img src="https://nodejs.org/static/images/logo.svg" width="100px" align="right">

#   Futebol Clube ⚽🏆

O   Futebol Clube, ou TFC, é um projeto que emula partidas e a classificação dos times de um campeonato de futebol.

O projeto foi feito com um frontend já implementado pela  , escola de programação.
O foco do projeto era no backend, onde foi feita uma API REST para o site.

![Demo Aplicação](/front-example.png)

### Tecnologias utilizadas no seu desenvolvimento:
  - Express com Node.js + TypeScript
  - MySQL com Sequelize
  - Docker + Docker Compose (plugin v2)
  - Vite 5 (frontend)
  - Testes com Mocha, Chai e Sinon

### As principais habilidades desenvolvidas ao longo do projeto:
  - Escrita de testes unitários para garantir a qualidade e confiabilidade do código.
  - Dockerização completa das aplicações, incluindo configuração de redes, volumes e orquestração com Docker Compose.
  - Modelagem e gestão de dados no MySQL utilizando Sequelize, aplicando boas práticas de estruturação de banco de dados.
  - Criação e associação de tabelas de forma eficiente através dos models do Sequelize.
  - Desenvolvimento de APIs RESTful, implementando endpoints escaláveis e bem documentados.
  - Implementação de operações CRUD otimizadas, garantindo alto desempenho e segurança na manipulação de dados.

---

## Pré-requisitos

- [Docker](https://docs.docker.com/engine/install/) com o plugin **Docker Compose v2** (integrado ao Docker Desktop ou instalado via `docker compose plugin`)
- Node.js 20 LTS (para desenvolvimento local)
- npm

> **Atenção:** o projeto usa `docker compose` (sem hífen). O binário standalone `docker-compose` não é suportado.

---

## Usando Docker (recomendado)

Na pasta **raiz** do projeto execute:

```bash
npm run compose:up
```

Isso irá buildar e subir três containers:

| Serviço  | Porta | Descrição              |
|----------|-------|------------------------|
| frontend | 3000  | UI React (Vite)        |
| backend  | 3001  | API REST (Express/TS)  |
| db       | 3002  | MySQL 8                |

Aguarde todos os containers ficarem `healthy`:

```bash
cd app && docker compose ps
```

Acesse a aplicação em `http://localhost:3000`.

Para derrubar os containers:

```bash
npm run compose:down
```

---

## Usando localmente (sem Docker)

### Configurando variáveis de ambiente

As seguintes variáveis devem estar configuradas para o backend:

```
PORT=3001
DB_USER=root
DB_PASS=123456
DB_NAME=TRYBE_FUTEBOL_CLUBE
DB_HOST=localhost
DB_PORT=3306   # ou 3002 se usar o container `db` do Docker
```

> Se estiver usando apenas o container `db` (sem o backend em Docker), o MySQL fica disponível na porta **3002** do host. Use `DB_PORT=3002`.

### Iniciando o banco de dados

Para subir apenas o banco via Docker:

```bash
cd app && docker compose up db -d
```

### Iniciando o backend

Na pasta `./app/backend`:

```bash
npm run dev   # desenvolvimento com hot-reload (ts-node-dev)
# ou
npm start     # produção (compila TypeScript + inicia o servidor)
```

### Iniciando o frontend

Na pasta `./app/frontend`:

```bash
npm start     # inicia o Vite na porta 3000
```

Acesse `http://localhost:3000`.

---

## Executando testes do backend

Na pasta `./app/backend`:

```bash
npm test               # todos os testes
npm run test:coverage  # com relatório de cobertura
```

Para rodar um arquivo específico:

```bash
npx mocha -r ts-node/register ./src/tests/01.login.test.ts -t 10000 --exit
```
