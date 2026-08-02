# MULTI-TENANCY.md — academias, papéis e isolamento

O produto atende várias academias ao mesmo tempo, cada uma com seus professores e alunos. Este documento define quem enxerga o quê e como o isolamento é garantido.

## O tenant é a academia

`Gym` é a unidade de isolamento. Toda conta pertence a exatamente uma academia, e todo dado nasce carimbado com o `gymId` dela.

```
Academia Gaviões          Academia Bluefit
├── Prof. Douglas         ├── Prof. Renata
├── Victor  (aluno)       ├── Marina  (aluna)
├── Rafael  (aluno)       └── Bruno   (aluno)
└── Treinos A–E           └── Treinos A–C
```

Nenhuma seta atravessa a linha. Um professor da Gaviões não vê, não edita e nem sabe da existência dos alunos da Bluefit.

## Papéis

| Papel | Existe desde | O que faz |
|---|---|---|
| **Aluno** (`student`) | Fase 1 | Vê os treinos atribuídos a ele, registra séries, cargas, refeições e água, ajusta as próprias metas |
| **Professor** (`trainer`) | Fase 1 | Cadastra alunos, monta e atribui treinos, resolve pendências, configura a identidade visual da academia |
| **Admin da academia** (`gym_admin`) | Fase 2 | Tudo do professor, mais gestão de professores e dados da academia |
| **Distribuidor** (`distributor`) | Fase 2 | Cria academias, configura marcas, gerencia contratos. Único papel que atravessa tenants |

Na Fase 1 existem só dois papéis. O professor acumula o que na Fase 2 se divide entre professor, admin da academia e distribuidor — inclusive a configuração de cores da marca, já que nesta fase é você mesmo operando o app para montar as demonstrações.

## Matriz de permissões — Fase 1

| Ação | Aluno | Professor |
|---|---|---|
| Ver os próprios treinos | ✅ | — |
| Ver treinos de outro aluno | ❌ | ✅ (da mesma academia) |
| Criar e editar planos | ❌ | ✅ |
| Atribuir plano a aluno | ❌ | ✅ |
| Marcar série, registrar carga | ✅ (só o próprio) | ❌ |
| Registrar refeição e água | ✅ (só o próprio) | ❌ |
| Ajustar as próprias metas | ✅ | ❌ |
| Cadastrar aluno | ❌ | ✅ |
| Ver ficha de aluno | ❌ | ✅ (da mesma academia) |
| Resolver pendências | ❌ | ✅ |
| Configurar marca da academia | ❌ | ✅ |
| Ver dados de outra academia | ❌ | ❌ |

## Como o isolamento é garantido

Três camadas, e nenhuma delas dispensa as outras.

### 1. Escopo explícito no repositório

Nenhum método de repositório assume uma "academia atual". O `gymId` entra por parâmetro, sempre:

```ts
// certo
listPlansForStudent(gymId: string, studentId: string): Promise<WorkoutPlan[]>

// errado — depende de estado global e some na revisão
listPlansForStudent(studentId: string): Promise<WorkoutPlan[]>
```

Quem conhece a academia ativa é a camada de sessão, que a repassa a cada chamada. Isso torna qualquer vazamento visível na assinatura da função.

### 2. Guards de rota por papel

As rotas do painel exigem `role === 'trainer'`; as do aluno exigem `role === 'student'`. Um aluno que digite `/gym/alunos` na barra de endereço é redirecionado, não recebe uma tela vazia.

### 3. Filtro na leitura

Os adapters de `localStorage` filtram por `gymId` antes de devolver qualquer coleção. Na Fase 2, o mesmo filtro acontece no servidor, com Row Level Security no PostgreSQL como segunda barreira — a aplicação nunca é a única linha de defesa.

## Cadastro e entrada

A primeira tela do app é o **seletor de perfil**: *Sou aluno* ou *Sou academia/professor*. É uma simplificação consciente da Fase 1 — na Fase 2 o papel vem do token e a tela desaparece.

**Aluno se cadastrando:** escolhe a academia numa lista, informa nome, e-mail e senha, e cai no onboarding. Fica sem treino até um professor atribuir um — situação normal, que gera a pendência `new_student` no painel daquela academia.

**Professor se cadastrando:** cria uma academia nova (nome, cores, logo) ou entra numa existente. Ao criar, a academia nasce vazia, sem alunos e sem planos.

**E-mail é único dentro da academia, não globalmente.** A mesma pessoa pode ser aluna da Gaviões e da Bluefit com o mesmo e-mail: são duas contas independentes. Na Fase 2 isso vira uma identidade com múltiplos vínculos (`membership`), e a decisão de qual modelo adotar está registrada como pendente.

## Troca de academia

Um usuário não troca de academia — ele sai e entra em outra conta. O único caso de acesso multi-tenant é o distribuidor, que só existe a partir da Fase 2.

## Dados de demonstração

O seed cria três academias completas, com professores, alunos, planos e histórico. Serve para exercitar o isolamento de verdade: entre como professor de uma delas e confirme que os alunos das outras duas não aparecem em lugar nenhum. As contas estão em [`SEED-DATA.md`](SEED-DATA.md).

## Testes obrigatórios de isolamento

Não são opcionais, e cada um deve falhar de forma óbvia se o filtro for removido:

1. Professor da Academia A lista alunos → nenhum aluno de B ou C aparece
2. Aluno de A lista treinos → só os planos atribuídos a ele, todos de A
3. Plano criado em A não aparece na listagem de B
4. Pendências de A não contam alunos de B
5. Aluno tentando abrir rota do painel é redirecionado
6. Duas academias com o mesmo nome de aluno não se misturam
