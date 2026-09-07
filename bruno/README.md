# Coleção Bruno — gerador-provas-api

## Configuração inicial

1. Abra o Bruno e importe esta pasta.
2. Selecione o ambiente **local** (pasta `environments/local.bru`).
3. `baseUrl` está configurado como `http://localhost:3000`.

## Ordem obrigatória (FK)

As requisições têm dependências de chave estrangeira. Execute **sempre** nesta ordem:

```
1. users/create-user.bru
     └─ salva → {{userId}}

2. subjects/create-subject.bru   (usa {{userId}} como professorId)
     └─ salva → {{subjectId}}

3. questions/create-question.bru  (usa {{subjectId}})
     └─ salva → {{questionId}}
```

Os scripts `after-response` salvam os IDs automaticamente nas variáveis de ambiente.

## Estrutura das coleções

| Pasta | Requests | Descrição |
|-------|----------|-----------|
| `users/` | health, status-v1, list, create, get, update, delete | Users v1 (referência) |
| `subjects/` | list, create, get, update, delete | Subject v1 (exercício) |
| `questions/` | list, create, get, update, delete | Question v1 (exercício) |
| `v2/` | status, list-users | v2 — expandir na aula 8 |

## Variáveis de ambiente (local.bru)

| Variável | Valor | Definida por |
|----------|-------|--------------|
| `baseUrl` | `http://localhost:3000` | Fixo |
| `userId` | dinâmico | Script after-response de create-user |
| `subjectId` | dinâmico | Script after-response de create-subject |
| `questionId` | dinâmico | Script after-response de create-question |
| `token` | dinâmico | Aula 11: script after-response de login |

## Assertions

Cada request tem assertions básicas. A partir da aula 3, o aluno deve completar assertions
para Subject e Question seguindo o mesmo padrão de Users.
