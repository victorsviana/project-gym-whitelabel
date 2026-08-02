# ADR-0004 — Multi-tenancy já na Fase 1

**Data:** 01/08/2026 · **Status:** Aceita

## Contexto

O protótipo é single-user e single-tenant: um aluno implícito, uma lista de treinos global, e um painel de professor que é fachada — publicar um treino apenas mostra um aviso, sem alterar nada para ninguém.

O produto real é o oposto: N academias, cada uma com seus professores e alunos, e o valor central está justamente no encontro entre os dois perfis — o professor monta o treino, o aluno recebe.

A pergunta era se a Fase 1 deveria ser só o app do aluno, deixando academias e perfis para a Fase 2, quando houver banco de verdade.

## Decisão

A Fase 1 já nasce **multi-tenant, com os dois perfis funcionando de verdade** sobre `localStorage`:

- `Gym` é uma entidade real; toda outra entidade carrega `gymId`
- Contas de aluno e de professor, com sessão persistida e guards de rota por papel
- O professor monta o treino, atribui a alunos específicos e publica; o aluno vê
- Dados de demonstração com três academias, para exercitar o isolamento desde o primeiro dia

## Alternativas consideradas

**Só o app do aluno na Fase 1, com treinos fixos.** Entregaria uma tela navegável mais rápido, mas com uma demonstração que não demonstra o produto: sem o professor, é só mais um app de treino. E o modelo de dados teria que ser refeito na Fase 2 para acomodar tenant e atribuição — reescrevendo, junto, as telas construídas sobre ele.

**Multi-tenant no dado, mas só o app do aluno na interface.** Metade do custo, sem o benefício de validar o fluxo que dá sentido ao produto. Adiar a construção do painel também adia a descoberta dos problemas dele.

**Esperar a Fase 2 para separar perfis.** Significaria construir a Fase 1 inteira sobre um modelo que se sabe errado. Multi-tenancy não é funcionalidade que se acrescenta depois: é premissa que atravessa modelo de dados, rotas, consultas e testes.

## Consequências

**Bom:** o modelo de dados da Fase 1 é o mesmo da Fase 2, promovido a tabelas — a migração vira tradução, não redesenho; o produto é demonstrável de ponta a ponta desde a Fase 1; os erros de isolamento aparecem cedo, com `localStorage`, onde custam minutos.

**Ruim:** a Fase 1 fica visivelmente maior — o painel da academia é praticamente um segundo aplicativo; e há disciplina permanente em passar `gymId` explicitamente em cada chamada de repositório, o que é verboso de propósito.

**Consequência que orienta o resto:** como não há servidor, **o isolamento da Fase 1 é organizacional, não de segurança**. Os dados de todas as academias estão no mesmo `localStorage`, acessíveis a quem abrir o console. Isso é aceitável porque na Fase 1 só existem dados de demonstração. A partir da Fase 2, o isolamento passa a valer de verdade, com filtro no servidor e Row Level Security no banco.
