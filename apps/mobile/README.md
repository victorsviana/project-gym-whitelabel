# @gym/mobile — app nativo (Fase 3)

App iOS e Android consumindo a API da Fase 2.

**Status:** não iniciado. Começa depois que a Fase 2 fechar — ver [`../../docs/ROADMAP.md`](../../docs/ROADMAP.md).

## Stack planejada

React Native · Expo · expo-router · Expo Notifications · SQLite (offline) · EAS Build

## Escopo

- Reaproveita `@gym/core` inteiro: tipos, contratos, regras de domínio e cliente de API
- Push nativo via APNs/FCM, substituindo o Web Push
- Offline com SQLite, biometria, deep links
- Build e distribuição por EAS

## Decisão em aberto

Whitelabel nativo tem dois modelos possíveis, e a escolha é comercial antes de ser técnica:

1. **Um binário por academia** — cada cliente publica na loja com a própria marca. Melhor percepção de marca, custo de publicação e manutenção multiplicado por cliente.
2. **App único multi-marca** — a academia é escolhida no login e o tema se aplica em runtime, como já acontece na Fase 1. Um só binário, marca menos presente na loja.

Registrar a decisão em `../../docs/decisions/` quando for tomada.
