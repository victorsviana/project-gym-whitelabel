# PROJECT.md — o produto

## O problema

Academias de bairro e redes de médio porte entregam treino em papel, planilha ou PDF no WhatsApp. O aluno perde a ficha, não sabe se está evoluindo, não tem orientação de dieta e some depois do segundo mês. A academia, por sua vez, não tem nenhum canal próprio com o aluno fora das quatro paredes: quem tem o relacionamento digital é o app genérico de treino que o aluno baixou por conta própria.

Apps prontos de mercado resolvem para o aluno, mas com a marca de outra empresa. A academia vira coadjuvante do próprio serviço.

## A proposta

Um app **whitelabel**: a academia entrega aos alunos um aplicativo com o nome, o logo e as cores dela. Quem monta o treino é o professor da casa, dentro de um painel próprio. O aluno acompanha treino, dieta e evolução em um app que, para ele, é "o app da minha academia".

O produto é vendido pelo distribuidor (você) para várias academias. Cada academia é um tenant isolado, com identidade visual própria, seus professores e seus alunos.

## Personas

| Persona | Quem é | O que precisa |
|---|---|---|
| **Aluno** | Frequenta a academia, do iniciante ao avançado | Saber o que treinar hoje, registrar séries e cargas, ver que está evoluindo, ter meta de dieta clara e simples de acompanhar |
| **Professor** | Monta e ajusta os treinos dos alunos daquela academia | Montar treino rápido, atribuir a um ou vários alunos, ver quem está sem treino ou pediu troca, publicar e saber que o aluno recebeu |
| **Dono da academia** | Contrata o whitelabel | Fidelizar aluno, ter a marca no celular dele, acompanhar engajamento |
| **Distribuidor** | Vende e opera o whitelabel (você) | Cadastrar uma academia nova e configurar a identidade visual dela em minutos, sem rebuild e sem tocar em código |

## Proposta de valor

- **Para o aluno:** treino e dieta no bolso, montados por gente de verdade da academia dele, com histórico de carga que mostra evolução.
- **Para a academia:** presença digital com a própria marca, sem desenvolver nada, e uma ferramenta de trabalho para o professor.
- **Para o distribuidor:** um único produto que atende N academias, com onboarding de cliente novo resumido a cadastrar a academia e escolher duas cores.

## Escopo por fase

Detalhamento, épicos e critérios de aceite em [`ROADMAP.md`](ROADMAP.md).

| Fase | Entrega | Persistência |
|---|---|---|
| **1** | PWA web completa, multi-tenant, com aluno e professor funcionando | `localStorage` |
| **2** | API, banco, autenticação real, Web Push, painel admin real | PostgreSQL |
| **3** | App nativo iOS/Android | API da Fase 2 + SQLite offline |

### Não-escopo (nas três fases)

Pagamento e cobrança dentro do app · controle de acesso à catraca · aula coletiva e agendamento · rede social entre alunos · vídeo dos exercícios com player próprio · avaliação física com bioimpedância integrada.

Nada disso está descartado como produto — apenas não entra no caminho até a Fase 3.

## Requisitos não-funcionais

| Requisito | Alvo |
|---|---|
| **Offline** | O aluno treina no subsolo da academia, sem sinal. O app funciona inteiro offline na Fase 1; na Fase 2, offline-first com sincronização |
| **Performance** | Primeira renderização útil abaixo de 2 s em 4G; interação sem travar em celular popular Android |
| **Instalável** | PWA instalável com ícone e splash da academia, abrindo em modo standalone |
| **Isolamento** | Nenhum dado atravessa academias. Toda consulta é filtrada por `gymId` |
| **Acessibilidade** | Navegação por teclado, contraste mínimo AA, respeito a `prefers-reduced-motion` |
| **Idioma** | Interface inteiramente em português do Brasil |
| **Privacidade** | Treino e alimentação são dados de saúde. Consentimento, exportação e exclusão de conta a partir da Fase 2 (LGPD) |

## Decisões tomadas

Cada uma tem uma ADR em [`decisions/`](decisions/) com as alternativas descartadas.

| # | Decisão | ADR |
|---|---|---|
| 1 | Monorepo com npm workspaces, `apps/{web,api,mobile}` + `shared/core` | [ADR-0001](decisions/ADR-0001-monorepo-npm-workspaces.md) |
| 2 | Fase 1 em React + TypeScript + Vite + PWA | [ADR-0002](decisions/ADR-0002-stack-fase-1.md) |
| 3 | Tailwind com tokens ligados a CSS vars, para trocar de marca em runtime | [ADR-0003](decisions/ADR-0003-tailwind-tema-runtime.md) |
| 4 | Multi-tenancy já na Fase 1, com dados isolados por `gymId` no `localStorage` | [ADR-0004](decisions/ADR-0004-multi-tenancy-fase-1.md) |
| 5 | Fase 2 com NestJS + Prisma + PostgreSQL | [ADR-0005](decisions/ADR-0005-backend-fase-2.md) |
| 6 | Fase 3 em React Native + Expo | [ADR-0006](decisions/ADR-0006-nativo-fase-3.md) |

## Questões em aberto

Precisam de resposta do negócio antes das fases indicadas.

| Questão | Impacto | Quando decidir |
|---|---|---|
| Modelo de cobrança: por academia, por aluno ativo ou por faixa? | Define se é preciso medir uso por tenant desde já | Fase 2 |
| Quem cadastra o aluno na prática: a recepção, o professor ou o próprio aluno com código da academia? | Muda o fluxo de entrada e a tela de cadastro | Fase 1 (assumido: professor cadastra, aluno também pode se cadastrar escolhendo a academia) |
| Integração com ERP de academia (Pacto, Evo, Tecnofit) para importar matrícula | Evita cadastro duplicado; pode virar o principal argumento de venda | Fase 2 |
| Avaliação física periódica com histórico de medidas | Hoje só existe a avaliação inicial do onboarding | Fase 2 |
| Chat aluno ↔ professor | Alto valor percebido, alto custo de moderação e suporte | Fase 3 |
| Registro de refeição por áudio: vira IA real ou continua simulado? | No protótipo é simulado com valores fixos | Fase 2 |
| Whitelabel nativo: um binário por academia ou app único multi-marca? | Multiplica ou não o custo de publicação nas lojas | Fase 3 |

## Glossário

| Termo | Significado |
|---|---|
| **Academia** (`gym`) | O tenant. Cliente do whitelabel, com marca, professores e alunos próprios |
| **Distribuidor** | Quem vende e opera o whitelabel; configura academias e identidades visuais |
| **Plano** / **Treino** (`workout plan`) | Conjunto de exercícios com séries e repetições, identificado por letra (A, B, C…) |
| **Atribuição** (`assignment`) | Vínculo entre um plano e um aluno. É o que faz o treino aparecer para ele |
| **Série** (`set`) | Uma execução do exercício. O aluno marca cada série concluída |
| **Carga** (`load`) | Peso usado em um exercício, registrado por dia para formar histórico |
| **Meta diária** | Alvo de calorias, proteína, carboidrato, gordura e água, calculado na avaliação |
| **Sequência** / **streak** | Dias consecutivos com atividade registrada até hoje |
| **Adaptado** | Exercício ou plano ajustado por causa de lesão declarada pelo aluno |
| **Whitelabel** | Produto revendido sob a marca do cliente |
