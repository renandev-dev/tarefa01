import express from 'express';
import prisma from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const publicUser = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  createdAt: true,
};

const parseId = (value) => Number.parseInt(value, 10);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API do Gerador de Provas funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

const api = express.Router();

api.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

api.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({ select: publicUser });
  res.status(200).json({ success: true, data: users, total: users.length });
});

api.post('/users', async (req, res) => {
  const user = await prisma.user.create({
    data: {
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
      papel: req.body.papel,
    },
    select: publicUser,
  });
  res.status(201).json({ success: true, data: user });
});

api.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseId(req.params.id) },
    select: publicUser,
  });
  if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
  res.status(200).json({ success: true, data: user });
});

api.put('/users/:id', async (req, res) => {
  const user = await prisma.user.update({
    where: { id: parseId(req.params.id) },
    data: req.body,
    select: publicUser,
  });
  res.status(200).json({ success: true, data: user });
});

api.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: parseId(req.params.id) } });
  res.status(204).send();
});

api.get('/subjects', async (req, res) => {
  const subjects = await prisma.subject.findMany({
    include: { professor: { select: publicUser } },
  });
  res.status(200).json({ success: true, data: subjects, total: subjects.length });
});

api.post('/subjects', async (req, res) => {
  const subject = await prisma.subject.create({
    data: { nome: req.body.nome, professorId: req.body.professorId },
  });
  res.status(201).json({ success: true, data: subject });
});

api.get('/subjects/:id', async (req, res) => {
  const subject = await prisma.subject.findUnique({ where: { id: parseId(req.params.id) } });
  if (!subject) return res.status(404).json({ success: false, message: 'Matéria não encontrada' });
  res.status(200).json({ success: true, data: subject });
});

api.put('/subjects/:id', async (req, res) => {
  const subject = await prisma.subject.update({
    where: { id: parseId(req.params.id) },
    data: req.body,
  });
  res.status(200).json({ success: true, data: subject });
});

api.delete('/subjects/:id', async (req, res) => {
  await prisma.subject.delete({ where: { id: parseId(req.params.id) } });
  res.status(204).send();
});

const questionInclude = {
  subject: true,
  author: { select: publicUser },
};

api.get('/questions', async (req, res) => {
  const questions = await prisma.question.findMany({ include: questionInclude });
  res.status(200).json({ success: true, data: questions, total: questions.length });
});

api.post('/questions', async (req, res) => {
  const question = await prisma.question.create({
    data: {
      enunciado: req.body.enunciado,
      dificuldade: req.body.dificuldade,
      respostaCorreta: req.body.respostaCorreta,
      subjectId: req.body.subjectId,
      authorId: req.body.authorId,
    },
    include: questionInclude,
  });
  res.status(201).json({ success: true, data: question });
});

api.get('/questions/:id', async (req, res) => {
  const question = await prisma.question.findUnique({
    where: { id: parseId(req.params.id) },
    include: questionInclude,
  });
  if (!question) return res.status(404).json({ success: false, message: 'Questão não encontrada' });
  res.status(200).json({ success: true, data: question });
});

api.put('/questions/:id', async (req, res) => {
  const question = await prisma.question.update({
    where: { id: parseId(req.params.id) },
    data: req.body,
    include: questionInclude,
  });
  res.status(200).json({ success: true, data: question });
});

api.delete('/questions/:id', async (req, res) => {
  await prisma.question.delete({ where: { id: parseId(req.params.id) } });
  res.status(204).send();
});

app.use(api);
app.use('/api/v1', api);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
