## Atividade #04 — CRUD de Subject e Question

Nesta atividade a organização do projeto e o modelo de dados foram estendidos para cobrir matérias e questões, replicando o mesmo padrão de validação e resposta HTTP usado em `User`.

### 1. Novos models no schema

Em `prisma/schema.prisma` foram adicionados os models `Subject` e `Question`, com os relacionamentos:

- `User 1:N Subject` — um professor pode ser responsável por várias matérias (`professorId`)
- `User 1:N Question` — um professor pode ser autor de várias questões (`authorId`)
- `Subject 1:N Question` — uma matéria pode ter várias questões (`subjectId`)

Os nomes em JavaScript ficam em camelCase (`professorId`, `subjectId`, `authorId`, `respostaCorreta`), mas as colunas no banco continuam em snake_case via `@map` (`professor_id`, `disciplina_id`, `autor_id`, `resposta_correta`).

`Question` também tem o campo `dificuldade` (inteiro obrigatório: `1` fácil, `2` média, `3` difícil) e `resposta_correta` (texto opcional).

### 2. Migration

```bash
npx prisma migrate dev --name add-subjects-and-questions
npx prisma generate
```

Isso criou as tabelas `subjects` e `questions` no banco Neon, com as foreign keys para `users` e entre si.

### 3. Reorganização em controllers e routes

O código de rotas foi separado em camadas, replicando a organização já usada para `User`:

```
src/
├── server.js
├── config/
│   └── database.js
├── controllers/
│   ├── userController.js
│   ├── subjectController.js
│   └── questionController.js
├── routes/
│   ├── userRoutes.js
│   ├── subjectRoutes.js
│   └── questionRoutes.js
└── utils/
    ├── selects.js        (select público reutilizável de User)
    └── validators.js     (validação de ID e de string obrigatória)
```

`server.js` ficou responsável apenas por montar o Express e registrar os roteadores; toda a lógica de banco e validação vive nos controllers.

### 4. Validações implementadas

Em `subjectController.js` e `questionController.js`, antes de qualquer escrita no banco:

- Campos obrigatórios são validados (`nome`, `enunciado`, `dificuldade` como `1`/`2`/`3`);
- IDs recebidos no corpo ou na URL são validados como inteiros positivos;
- Antes de criar uma matéria, confirma-se que o `professorId` existe; antes de criar uma questão, confirma-se que `subjectId` e `authorId` existem — caso contrário, a API responde `404` sem chegar a tentar o `create`;
- Erros inesperados (ex.: falha de conexão com o banco) nunca retornam detalhes internos ao cliente — a mensagem é genérica e o erro real é logado no servidor via `console.error`;
- As relações (`professor`, `subject`, `author`) são sempre retornadas com `select`/`include` restritos aos campos públicos, nunca expondo a senha do usuário.

### 5. Endpoints implementados

| Método | Rota | Finalidade | Sucesso |
|---|---|---|---|
| POST | `/subjects` | Criar uma matéria vinculada a um professor | `201` |
| GET | `/subjects` | Listar matérias com o professor responsável | `200` |
| GET | `/subjects/:id` | Buscar uma matéria pelo ID | `200` |
| POST | `/questions` | Criar uma questão vinculada a uma matéria e autor | `201` |
| GET | `/questions` | Listar questões com matéria e autor | `200` |
| GET | `/questions/:id` | Buscar uma questão pelo ID | `200` |

As rotas de listagem seguem o mesmo formato usado em `/users`:

```json
{
  "success": true,
  "data": [],
  "total": 0
}
```

### 6. Testes

As rotas foram testadas com o **Bruno**, no ambiente Local, cobrindo:

- criação de matéria e questão com dados válidos (`201`);
- campos obrigatórios ausentes (`400`);
- IDs inválidos, como texto no lugar de número (`400`);
- professor, matéria ou autor inexistentes (`404`);
- listagem e busca por ID (`200`);
- busca por ID inexistente (`404`).

A Collection completa foi executada via **Run**, confirmando todos os testes passando.

## Como rodar o projeto

```bash
npm install
# configurar o .env com a DATABASE_URL do Neon
npx prisma migrate dev
npx prisma generate
npm run dev
```

A API sobe por padrão em `http://localhost:3000`.

## Rotas disponíveis

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check da API |
| GET | `/users` | Lista os professores cadastrados |
| POST | `/users` | Cria um professor |
| GET | `/users/:id` | Busca um professor pelo ID |
| PUT | `/users/:id` | Atualiza um professor |
| DELETE | `/users/:id` | Remove um professor |
| GET | `/subjects` | Lista as matérias, com dados do professor |
| POST | `/subjects` | Cria uma matéria vinculada a um professor |
| GET | `/subjects/:id` | Busca uma matéria pelo ID |
| GET | `/questions` | Lista as questões, com matéria e autor |
| POST | `/questions` | Cria uma questão vinculada a matéria e autor |
| GET | `/questions/:id` | Busca uma questão pelo ID |
