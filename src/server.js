// src/server.js
import express from 'express';
import prisma from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API do Gerador de Provas funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Rota de usuários (professores) — agora usando o banco real
app.get('/users', async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

// Rota de matérias
app.get('/subjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

// Rota de questões
app.get('/questions', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        subject: true,
        author: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Usuários: http://localhost:${PORT}/users`);
  console.log(`📚 Matérias: http://localhost:${PORT}/subjects`);
  console.log(`❓ Questões: http://localhost:${PORT}/questions`);
});