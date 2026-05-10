# Documentação do Projeto TFC

Documentação seguindo o modelo SDD (Spec-Driven Development) com TDD.

## Estrutura

```
docs/
├── prd/     — Product Requirements Documents (o quê e por quê, nível de negócio)
├── srd/     — System Requirements Documents (requisitos técnicos do sistema)
├── specs/   — Design specs por feature (como construir, saída do brainstorming)
├── plans/   — Implementation plans por feature (passo a passo com código e testes)
├── adr/     — Architecture Decision Records (decisões técnicas imutáveis)
└── README.md
```

### Quando criar cada artefato

| Artefato | Quando criar | Quem lê |
|---|---|---|
| PRD | Início de uma iniciativa | Produto + Engenharia |
| SRD | Antes de detalhar specs | Engenharia |
| Spec | Antes de escrever qualquer código | Engenharia + IA |
| Plan | Depois de aprovar a spec | IA (implementação) |
| ADR | Ao tomar uma decisão técnica relevante | Todos |

### Fluxo SDD

```
PRD → SRD → Spec → Plan → Implementação (TDD)
```

### Convenção de nomes

- PRDs: `YYYY-MM-DD-<feature>-prd.md`
- SRDs: `YYYY-MM-DD-<feature>-srd.md`
- Specs: `YYYY-MM-DD-<feature>-design.md`
- Plans: `YYYY-MM-DD-<feature>.md`
- ADRs: `ADR-NNN-<decisao-em-kebab>.md`

---

## Documentos Ativos

### Iniciativa: TFC Revival (2026-05-09)

| Tipo | Documento | Status |
|---|---|---|
| PRD | [TFC Revival](prd/2026-05-09-tfc-revival-prd.md) | Aprovado |
| SRD | [TFC Revival](srd/2026-05-09-tfc-revival-srd.md) | Aprovado |
| Spec | [TFC Revival](specs/2026-05-09-tfc-revival-design.md) | Aprovado |
| Plan | [TFC Revival](plans/2026-05-09-tfc-revival.md) | Concluído |

### ADRs

| ID | Decisão | Status |
|---|---|---|
| [ADR-001](adr/ADR-001-node-20-lts.md) | Adotar Node 20 LTS | Aceito |
| [ADR-002](adr/ADR-002-vite-migration.md) | Migrar CRA → Vite | Aceito |
| [ADR-003](adr/ADR-003-docker-compose-plugin.md) | `docker compose` plugin v2 | Aceito |
