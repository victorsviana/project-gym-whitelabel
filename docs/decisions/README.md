# Decisões de arquitetura (ADRs)

Registro curto de cada decisão estrutural: o contexto, a escolha, as alternativas descartadas e as consequências. Serve para que ninguém — pessoa ou IA — reabra uma discussão já encerrada sem saber por que ela foi encerrada.

| # | Decisão | Data | Status |
|---|---|---|---|
| [0001](ADR-0001-monorepo-npm-workspaces.md) | Monorepo com npm workspaces | 01/08/2026 | Aceita |
| [0002](ADR-0002-stack-fase-1.md) | React + TypeScript + Vite na Fase 1 | 01/08/2026 | Aceita |
| [0003](ADR-0003-tailwind-tema-runtime.md) | Tailwind com tokens ligados a CSS vars | 01/08/2026 | Aceita |
| [0004](ADR-0004-multi-tenancy-fase-1.md) | Multi-tenancy já na Fase 1 | 01/08/2026 | Aceita |
| [0005](ADR-0005-backend-fase-2.md) | NestJS + Prisma + PostgreSQL na Fase 2 | 01/08/2026 | Aceita |
| [0006](ADR-0006-nativo-fase-3.md) | React Native + Expo na Fase 3 | 01/08/2026 | Aceita |

## Como escrever uma nova

Copie a estrutura de qualquer uma: **Contexto** (o problema e as forças em jogo), **Decisão** (o que foi escolhido), **Alternativas consideradas** (com o motivo real da recusa), **Consequências** (o bom e o ruim que vêm junto).

Numere em sequência. ADR não se apaga: se for revertida, marque como *Substituída por ADR-XXXX* e escreva a nova.
