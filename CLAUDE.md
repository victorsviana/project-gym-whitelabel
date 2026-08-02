# CLAUDE.md

As instruções deste repositório estão em **[AGENTS.md](AGENTS.md)** — leia esse arquivo primeiro.

Resumo do que ele diz:

1. Comece toda sessão lendo [`docs/STATE.md`](docs/STATE.md) e termine atualizando-o.
2. Regra de negócio mora em `shared/core`, em TypeScript puro.
3. Todo acesso a dado passa por um repositório; nada de `localStorage` direto em componente.
4. Toda consulta filtra por `gymId`.
5. Cores vêm do tema da academia via CSS vars — nunca hardcoded.
6. Gerenciador de pacotes: **npm** (workspaces).
