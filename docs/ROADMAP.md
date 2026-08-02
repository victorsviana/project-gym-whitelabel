# ROADMAP.md — as três fases

Cada épico tem um identificador (`F1-E01`, `F2-E03`…) usado no [`STATE.md`](STATE.md) e nas mensagens de commit.

---

# Fase 1 — PWA multi-tenant com os dois perfis

**Objetivo:** o app inteiro funcionando, com aluno e academia, sem nenhum servidor. Tudo persiste em `localStorage`.

**Stack:** React 18 · TypeScript strict · Vite · Tailwind · Zustand · React Router · `vite-plugin-pwa` · Vitest + Testing Library · npm workspaces.

**Definição de pronto da fase:**

1. Entro como professor da Academia A, crio um treino, atribuo a um aluno. Entro como esse aluno e o treino está lá. Recarrego a página e continua lá.
2. Aluno da Academia A não enxerga nenhum dado da Academia B. Cada academia abre com a própria identidade visual.
3. Paridade com o protótipo pela checklist de [`UI-SPEC.md`](UI-SPEC.md) — sem a moldura de iPhone.
4. Funciona 100 % offline, é instalável e as regras de domínio têm cobertura de teste.
5. Os 10 defeitos de [`PROTOTYPE-AUDIT.md`](PROTOTYPE-AUDIT.md) estão corrigidos.

## Épicos

### Fundação

**F1-E01 · Monorepo e ferramental**
Workspaces npm (`apps/*`, `shared/*`), `apps/web` com Vite + React + TS strict, ESLint + Prettier, Vitest, scripts de raiz, CI rodando lint + typecheck + test.
*Aceite:* `npm install && npm run dev` sobe a app; `npm run typecheck` e `npm run test` passam.

**F1-E02 · Design system em Tailwind**
Tailwind configurado com tokens ligados a CSS vars; tipografia Barlow / Barlow Condensed; temas escuro e claro; componentes base: `Button`, `Card`, `Chip`, `Stepper`, `Toggle`, `Sheet`, `ProgressBar`, `Ring`, `SegmentedControl`, `EmptyState`, `Toast`. Responsivo desde o início, **sem moldura de celular**.
*Aceite:* uma página de showcase renderiza todos os componentes nos dois temas e em três larguras (360, 768, 1280).
*Referência:* [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)

**F1-E03 · Domínio em `@gym/core`**
Tipos e enums de todas as entidades; funções puras de cálculo: TMB, TDEE, ajuste por objetivo, macros, água, streak, progresso de séries, delta de carga; utilitários de data em ISO.
*Aceite:* todas as fórmulas de [`DOMAIN-RULES.md`](DOMAIN-RULES.md) implementadas, com os casos de teste daquele documento passando.

**F1-E04 · Repositórios e persistência**
Contratos de repositório em `@gym/core`; adapters `localStorage` em `apps/web/src/storage/`; schema versionado (`gymapp:v1`) com rotina de migração; seed idempotente na primeira execução.
*Aceite:* nenhum componente referencia `localStorage`; trocar o adapter por um fake em memória mantém os testes passando.
*Referência:* [`DATA-MODEL.md`](DATA-MODEL.md)

**F1-E05 · Dados de demonstração multi-tenant**
Três academias com identidades visuais distintas, cada uma com professor, alunos, planos, atribuições e histórico já populados. Ação de "restaurar dados de demonstração".
*Aceite:* as contas de [`SEED-DATA.md`](SEED-DATA.md) existem e entram no app; os históricos são plausíveis (cargas crescentes, dias ativos espalhados no mês).

### Entrada e identidade

**F1-E06 · Seletor de perfil e autenticação mockada**
Primeira tela: *Sou aluno* · *Sou academia/professor*. Login e cadastro por perfil, sem senha real (validação apenas de formato), sessão persistida, logout. Aluno se cadastra escolhendo a academia; professor se cadastra criando ou escolhendo a academia. Modo demo com troca rápida de usuário.
*Aceite:* a sessão sobrevive a recarregar; guard de rota impede aluno de abrir `/gym` e professor de abrir telas de aluno.

**F1-E07 · Identidade visual da academia**
Tela de marca no painel: nome, logo (upload convertido para data URL), cor primária, cor de contraste, presets prontos, preview ao vivo. É onde o distribuidor configura a marca de cada cliente.
*Aceite:* mudar a cor repinta o app inteiro sem recarregar; a escolha persiste e vale para todos os usuários daquela academia.
*Referência:* [`WHITELABEL.md`](WHITELABEL.md)

### App do aluno

**F1-E08 · Onboarding e metas**
Sete passos (intro · sexo e idade · peso e altura · objetivo · nível e frequência · lesões · restrições), barra de progresso, voltar/avançar, tela de processamento e tela de metas com kcal, macros, TMB, TDEE e ajuste. Alerta de treino adaptado quando há lesão.
*Aceite:* os números batem com [`DOMAIN-RULES.md`](DOMAIN-RULES.md); o perfil fica salvo e reaparece em Ajustes.

**F1-E09 · Home do aluno**
Saudação e data; card do treino de hoje; calendário do mês com dias ativos, sequência e clique abrindo o extrato do dia; anel de calorias; barras de proteína, carboidrato e gordura; hidratação em copos de 250 ml.
*Aceite:* registrar refeição ou série atualiza os indicadores na hora; o extrato do dia mostra refeições e treinos daquela data.

**F1-E10 · Treino do aluno**
Lista dos planos atribuídos com progresso de séries e selo *Adaptado*; detalhe com cronômetro de sessão, timer de descanso (60/90/120 s, alerta visual nos últimos 10 s), marcação de séries, registro de carga (±2,5 kg), histórico das últimas seis cargas e delta desde a primeira.
*Aceite:* progresso de séries reseta a cada dia; carga registrada aparece no histórico e no gráfico; os timers não perdem tempo com a aba em segundo plano.

**F1-E11 · Dieta do aluno**
Refeições do dia agrupadas por tipo com total por grupo e remoção; modal de registro com três métodos (buscar na base por 100 g com quantidade ajustável; escrever com macros manuais; áudio simulado); sugestões rápidas; histórico dos últimos sete dias com barra contra a meta.
*Aceite:* a base de alimentos é única; a refeição é sugerida pelo horário; o histórico ordena corretamente na virada de mês.

**F1-E12 · Perfil, ajustes e metas**
Estatísticas (sequência, dias no mês, séries); ajuste manual das metas de calorias, proteína, carboidrato e água; alternância de tema; preferências de notificação; dados da avaliação; sair da conta.
*Aceite:* ajustar meta reflete imediatamente na Home; tema e preferências persistem.

### Painel da academia

**F1-E13 · Alunos**
Dashboard com indicadores reais (alunos ativos, sem treino, pendências); lista com busca e filtro; ficha do aluno com avaliação, lesões, restrições, plano atual e última atividade; cadastro e edição de aluno.
*Aceite:* os números vêm dos dados reais do tenant, não de mock; cadastrar um aluno permite entrar com ele em seguida.

**F1-E14 · Montagem e atribuição de treino**
Criar plano; editar nome, foco, dia e duração; adicionar, editar e remover exercícios com séries e repetições; reordenar; duplicar plano; atribuir a um ou vários alunos; publicar com confirmação.
*Aceite:* publicar torna o plano visível para os alunos atribuídos; despublicar/desatribuir remove da lista do aluno; planos de uma academia nunca aparecem em outra.

**F1-E15 · Avisos e pendências**
Fila de pendências gerada pelos dados (aluno novo sem treino, pedido de troca, reavaliação vencida), com ação de resolver e atalho para a tela correspondente.
*Aceite:* cadastrar um aluno cria a pendência "sem treino"; atribuir um plano a ele a resolve automaticamente.

### Plataforma

**F1-E16 · PWA**
Manifest gerado com nome, ícone e cores da academia ativa; Service Worker com Workbox; funcionamento offline completo; convite de instalação; ícones e splash.
*Aceite:* instalável no Android e no iOS; abre em modo standalone; com a rede desligada o app continua inteiro utilizável.

**F1-E17 · Notificações locais**
Agendamento no Service Worker para lembrete de treino, de refeição, de hidratação e de reavaliação, respeitando as preferências do aluno; pedido de permissão no momento certo.
*Aceite:* com as notificações ligadas, o lembrete dispara no horário configurado com o app fechado (dentro do que o navegador permite).

**F1-E18 · Correção dos defeitos do protótipo**
Os 10 itens de [`PROTOTYPE-AUDIT.md`](PROTOTYPE-AUDIT.md).
*Aceite:* cada defeito tem um teste que falharia com o comportamento antigo.

**F1-E19 · Acessibilidade e responsividade**
Navegação por teclado com foco visível, rótulos e `aria` nos controles, contraste AA garantido inclusive nas cores de marca configuráveis, `prefers-reduced-motion`, layout de 320 px a desktop.
*Aceite:* auditoria sem erros críticos; o painel da academia usa o espaço em telas largas em vez de esticar uma coluna.

**F1-E20 · Testes, build e deploy**
Testes unitários do domínio, testes de componente dos fluxos críticos, teste de integração do fluxo professor→aluno, build de produção e publicação estática.
*Aceite:* pipeline verde e URL pública funcionando.

## Ordem sugerida

`E01 → E02 → E03 → E04 → E05 → E06 → E07` formam a base. Depois `E13 → E14` (para haver treino a exibir) antes de `E08 → E09 → E10 → E11 → E12`. `E15 → E16 → E17 → E18 → E19 → E20` fecham a fase. `E18` pode ser resolvido incrementalmente junto de cada épico correspondente.

---

# Fase 2 — API, banco e autenticação real

**Objetivo:** trocar o `localStorage` por um backend real, sem reescrever telas.

**Pré-requisito:** Fase 1 concluída, com contratos de repositório estáveis em `@gym/core`.

| ID | Épico | Aceite |
|---|---|---|
| **F2-E01** | Projeto NestJS + Prisma + PostgreSQL, migrations, ambientes | `npm run dev -w @gym/api` sobe a API com banco migrado |
| **F2-E02** | Modelagem multi-tenant (`gym_id` em tudo) e seed equivalente ao da Fase 1 | Nenhuma query sem escopo de tenant passa na revisão |
| **F2-E03** | Autenticação real: cadastro, login, JWT access + refresh, recuperação de senha | Tokens expiram e renovam corretamente |
| **F2-E04** | RBAC: `aluno`, `professor`, `admin_academia`, `distribuidor` | Testes de autorização cobrindo cada papel em cada rota |
| **F2-E05** | Endpoints de treino, atribuição, execução, dieta, água e metas | Contratos de `@gym/core` satisfeitos integralmente |
| **F2-E06** | Adapter HTTP dos repositórios e troca no `apps/web` | Nenhum componente alterado na migração |
| **F2-E07** | Importação do `localStorage` da Fase 1 para a conta no primeiro login | Usuário existente não perde histórico |
| **F2-E08** | Web Push com VAPID e agendamento no servidor | Notificação chega com o app fechado |
| **F2-E09** | Branding pela API: logo em object storage, subdomínio por academia | Trocar cor no painel reflete em todos os dispositivos |
| **F2-E10** | Painel do distribuidor: criar academia, configurar marca, gerir planos de contrato | Nova academia operacional sem tocar em código |
| **F2-E11** | OpenAPI + cliente TypeScript gerado, publicado em `@gym/core` | Web e mobile consomem o mesmo cliente |
| **F2-E12** | LGPD: consentimento, exportação e exclusão de conta | Fluxos completos e auditáveis |
| **F2-E13** | Observabilidade, rate limiting, backups, monitoramento | Alertas configurados |

---

# Fase 3 — App nativo

**Objetivo:** iOS e Android sobre a API da Fase 2, reaproveitando `@gym/core`.

**Pré-requisito:** Fase 2 em produção com OpenAPI estável.

| ID | Épico | Aceite |
|---|---|---|
| **F3-E01** | Projeto Expo + expo-router consumindo `@gym/core` | App roda no simulador com login real |
| **F3-E02** | Portar as telas do aluno para componentes nativos | Paridade funcional com a web |
| **F3-E03** | Portar o painel do professor (ou definir que fica só na web) | Decisão registrada em ADR |
| **F3-E04** | Push nativo via Expo Notifications (APNs/FCM) | Notificação recebida em background nas duas plataformas |
| **F3-E05** | Offline com SQLite e sincronização | App utilizável em modo avião, sincroniza ao voltar |
| **F3-E06** | Biometria, deep links, compartilhamento | Fluxos nativos funcionando |
| **F3-E07** | Whitelabel nativo conforme o modelo escolhido | Ver decisão em aberto abaixo |
| **F3-E08** | Build e distribuição por EAS, publicação nas lojas | App aprovado nas duas lojas |

**Decisão em aberto:** um binário por academia (marca própria na loja, custo multiplicado) ou app único multi-marca (academia escolhida no login, um binário só). É decisão comercial antes de técnica; registrar em `decisions/` quando definida.
