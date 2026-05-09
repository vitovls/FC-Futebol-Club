# PRD — TFC Revival

**Data:** 2026-05-09
**Autor:** Victor Veloso
**Status:** Aprovado

---

## Contexto

TFC (Trybe Futebol Clube) é um projeto legado de portfolio full-stack desenvolvido durante a formação na Trybe. Consiste em um frontend React (fornecido pela Trybe) e uma API REST Node/Express/TypeScript com banco MySQL. O último commit de código funcional data de 2022; desde então apenas READMEs foram atualizados.

O projeto está completamente inoperante: scripts deprecados, imagens Docker EOL, toolchain de frontend incompatível com versões atuais do Node.

---

## Objetivo

Restaurar o projeto ao estado "rodando" em dois ambientes:

1. **Local** — desenvolvimento com hot-reload (`npm run dev` no backend, `vite` no frontend, banco via Docker)
2. **Docker** — stack completa via `npm run compose:up` (3 containers: frontend, backend, db)

---

## Não está no escopo

- Novas funcionalidades de negócio
- Refatoração da lógica de backend (routes, controllers, services, models)
- Alteração do schema do banco ou seeds
- Mudança visual no frontend além do necessário para a migração Vite
- Autenticação nova, OAuth, ou qualquer feature adicional

---

## Critérios de Sucesso

| Critério | Como verificar |
|---|---|
| `npm run compose:up` sobe sem erros | `docker compose ps` mostra os 3 containers `healthy` |
| Frontend acessível | Browser abre `http://localhost:3000` sem erros de console |
| Backend responde | `curl http://localhost:3001/health` retorna 200 |
| Login funciona | POST `/login` com credenciais válidas retorna JWT |
| Clubes listados | GET `/clubs` retorna array não vazio |
| Partidas listadas | GET `/matchs` retorna array não vazio |
| Leaderboard funciona | GET `/leaderboard` retorna classificação ordenada |
| Dev local (backend) | `npm run dev` em `app/backend` compila e conecta ao banco |
| Dev local (frontend) | `npm start` em `app/frontend` abre Vite no port 3000 |

---

## Stakeholders

- **Victor Veloso** — desenvolvedor, único usuário do projeto

---

## Dependências

- Docker Desktop com WSL2 integration habilitada (Docker Compose plugin v2+)
- Node 20 LTS instalado localmente
- MySQL disponível localmente ou via container `db` do docker-compose
