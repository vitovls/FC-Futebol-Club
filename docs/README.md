# Documentação do Projeto TFC

Estrutura de documentação seguindo o modelo SDD (Subagent-Driven Development).

## Estrutura

```
docs/
├── prd/          — Product Requirements Documents
├── srd/          — System Requirements Documents
├── adr/          — Architecture Decision Records
├── plan/         — Implementation Plans (gerados pelo writing-plans)
├── tasks/        — Task breakdowns por feature/sprint
└── superpowers/
    └── specs/    — Design specs (output do brainstorming)
```

## Documentos Ativos

### Iniciativa: TFC Revival (2026-05-09)

| Tipo | Documento | Status |
|---|---|---|
| PRD | [TFC Revival](prd/2026-05-09-tfc-revival-prd.md) | Aprovado |
| SRD | [TFC Revival](srd/2026-05-09-tfc-revival-srd.md) | Aprovado |
| Design Spec | [TFC Revival](superpowers/specs/2026-05-09-tfc-revival-design.md) | Aprovado |
| Tasks | [TFC Revival](tasks/2026-05-09-tfc-revival-tasks.md) | Pendente impl. |
| Plan | *(gerado pelo writing-plans)* | Pendente |

### ADRs

| ID | Decisão | Status |
|---|---|---|
| [ADR-001](adr/ADR-001-node-20-lts.md) | Adotar Node 20 LTS | Aceito |
| [ADR-002](adr/ADR-002-vite-migration.md) | Migrar CRA → Vite | Aceito |
| [ADR-003](adr/ADR-003-docker-compose-plugin.md) | `docker compose` plugin v2 | Aceito |

## Convenção de Nomes

- PRDs e SRDs: `YYYY-MM-DD-<feature>-prd.md` / `-srd.md`
- Design specs: `YYYY-MM-DD-<feature>-design.md`
- Tasks: `YYYY-MM-DD-<feature>-tasks.md`
- ADRs: `ADR-NNN-<decisao-em-kebab>.md`
- Plans: `YYYY-MM-DD-<feature>-plan.md`
