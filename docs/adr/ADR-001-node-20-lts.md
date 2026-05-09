# ADR-001 — Adotar Node 20 LTS nos Dockerfiles

**Data:** 2026-05-09
**Status:** Aceito
**Decisores:** Victor Veloso

---

## Contexto

Os Dockerfiles usam `node:16-alpine`. Node 16 chegou ao EOL em setembro de 2023 — sem patches de segurança desde então. O ambiente local usa Node 22.18.0.

Três opções foram avaliadas:
- Manter Node 16 (EOL, sem patches de segurança)
- Migrar para Node 20 LTS (suporte até abril 2026)
- Migrar para Node 22 LTS (mesma versão do ambiente local)

## Decisão

**Node 20 LTS** (`node:20-alpine`).

## Justificativa

- Node 20 é a release LTS com suporte mais amplo e validada pela comunidade para as dependências do projeto (Sequelize 6, TypeScript 4, Vite 5)
- Node 22, embora seja a versão local, ainda tem menor cobertura de testes por parte dos pacotes legacy usados no backend
- Node 20 elimina a incompatibilidade OpenSSL que afeta Node 18+ com react-scripts 4.x — resolvida pela migração para Vite
- Divergência local (22) vs Docker (20) é aceitável: a API do Node usada pelo projeto não varia entre essas versões

## Consequências

- Imagem Docker mais segura e com suporte ativo
- Leve divergência entre Node local (22) e Docker (20) — monitorar se surgir incompatibilidade
- Precisa atualizar `node:16-alpine` → `node:20-alpine` em ambos os Dockerfiles
