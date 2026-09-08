# Gerador de Provas — API

API REST para o sistema **Gerador de Provas**, desenvolvida como parte da **Atividade #03** da disciplina de Back-end. O projeto evoluiu de um esqueleto Express com dados mockados para uma API real, com banco de dados PostgreSQL hospedado no **Neon**, usando **Prisma ORM** para modelagem e acesso aos dados.

## Stack utilizada

- **Node.js** com **Express 5**
- **Prisma ORM 7** (`prisma-client`, gerador novo, com `prisma.config.ts`)
- **PostgreSQL** via **Neon** (banco serverless na nuvem)
- **Bruno** para testes de API
- ES Modules (`"type": "module"` no `package.json`)

## Estrutura de dados

O projeto modela três entidades principais:

```
User 1:N Subject
User 1:N Question
Subject 1:N Question
```

- **User**: representa um professor. Autor de matérias e de questões.
- **Subject**: uma matéria/disciplina, vinculada a um professor responsável (`professorId`).
- **Question**: uma questão de prova, vinculada a uma matéria (`subjectId`) e a um autor (`authorId`).

Os nomes de campo usados no código (camelCase) são diferentes dos nomes de coluna no banco (snake_case), mapeados via `@map` no Prisma — por exemplo, `professorId` no JavaScript vira a coluna `professor_id` no PostgreSQL.

## Passo a passo do que foi feito

### 1. Ponto de partida

O projeto começou como um esqueleto Express simples (`src/server.js`), com:
- Rota `GET /health` para health check
- Rota `GET /users` retornando dados **mockados** (array fixo no código, sem banco de dados)

### 2. Instalação do Prisma

```bash
npm install prisma --save-dev
npm install dotenv
npx prisma init --datasource-provider postgresql
```

Isso criou a pasta `prisma/` com o `schema.prisma` e o arquivo `.env`.

### 3. Configuração do banco Neon

1. Criado um projeto gratuito no [Neon](https://neon.tech)
2. Copiada a connection string (formato pooled, com `sslmode=require`)
3. Colada no `.env`:
   ```
   DATABASE_URL="postgresql://usuario:senha@host-pooler.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```
4. Confirmado que `.env` está no `.gitignore`, para nunca subir a credencial pro GitHub

### 4. Ajuste para o Prisma 7

O Prisma 7 mudou onde a `DATABASE_URL` é lida: ela saiu do `schema.prisma` e passou a ser configurada em um novo arquivo, `prisma.config.ts`, na raiz do projeto:

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

O bloco `datasource` do `schema.prisma` ficou apenas com o provider, sem a `url`:

```prisma
datasource db {
  provider = "postgresql"
}
```

### 5. Modelagem do schema

Foram criados os models `User`, `Subject` e `Question` em `prisma/schema.prisma`, com os relacionamentos 1:N descritos acima e os campos mapeados para snake_case no banco via `@map`.

### 6. Migration

```bash
npx prisma migrate dev --name init-users-subjects-questions
npx prisma generate
```

Isso criou as tabelas `users`, `subjects` e `questions` diretamente no banco Neon, e gerou o Prisma Client em `src/generated/prisma` (saída customizada configurada no `generator client`).

### 7. Populando dados de teste

Usando o Prisma Studio:

```bash
npx prisma studio
```

Foram criados, nessa ordem:
1. Um usuário (professor)
2. Uma matéria vinculada a esse usuário
3. Uma questão vinculada ao usuário e à matéria

### 8. Rotas da API

Em `src/server.js`, além das rotas originais (`/health`, `/users`, agora lendo do banco real via Prisma em vez de dados mockados), foram adicionadas:

- **`GET /subjects`** — lista todas as matérias, incluindo os dados públicos do professor responsável (sem senha)
- **`GET /questions`** — lista todas as questões, incluindo a matéria e os dados públicos do autor (sem senha)

Todas as rotas seguem o formato de resposta:

```json
{
  "success": true,
  "data": [],
  "total": 0
}
```

Em caso de erro no banco, a API retorna `500` com uma mensagem genérica, sem expor detalhes internos do erro — o erro real é registrado no servidor via `console.error`.

### 9. Testes

As rotas foram testadas com o **Bruno**, selecionando o ambiente Local, com a API rodando localmente e a Collection executada por completo, confirmando `200 OK` em `/subjects` e `/questions`.

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
| GET | `/subjects` | Lista as matérias, com dados do professor |
| GET | `/questions` | Lista as questões, com matéria e autor |