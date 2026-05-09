# ADR-003 — Usar docker compose (plugin) em vez de docker-compose (standalone)

**Data:** 2026-05-09
**Status:** Aceito
**Decisores:** Victor Veloso

---

## Contexto

Os scripts no `package.json` raiz chamavam `docker-compose` (binário standalone, v1). No ambiente WSL2 com Docker Desktop, apenas o plugin `docker compose` (v2, integrado ao Docker CLI) está disponível.

## Decisão

Substituir todas as ocorrências de `docker-compose` por `docker compose` nos scripts npm.

## Justificativa

- Docker Compose v1 (standalone) foi descontinuado em julho de 2023
- Docker Desktop para Windows/WSL2 instala apenas o plugin v2
- O plugin é a implementação oficial e recomendada pelo Docker
- Nenhuma diferença de comportamento para os comandos usados (`up -d --build`, `down --remove-orphans`)

## Consequências

- Scripts `compose:up` e `compose:down` no `package.json` raiz atualizados (já feito)
- Qualquer documentação ou script shell que referencie `docker-compose` deve ser atualizado
