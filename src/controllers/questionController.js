import prisma from '../config/database.js';
import { publicUser } from '../utils/selects.js';
import { isValidId, isNonEmptyString, parseId } from '../utils/validators.js';

const questionInclude = {
  subject: true,
  author: { select: publicUser },
};

export const listQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({ include: questionInclude });
    res.status(200).json({ success: true, data: questions, total: questions.length });
  } catch (error) {
    console.error('Erro ao listar questões:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao listar questões.' });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { enunciado, dificuldade, respostaCorreta, subjectId, authorId } = req.body;

    if (!isNonEmptyString(enunciado)) {
      return res.status(400).json({ success: false, message: "O campo 'enunciado' é obrigatório." });
    }

    const dificuldadeNum = Number(dificuldade);
    if (![1, 2, 3].includes(dificuldadeNum)) {
      return res.status(400).json({
        success: false,
        message: "O campo 'dificuldade' deve ser 1 (fácil), 2 (média) ou 3 (difícil).",
      });
    }

    if (!isValidId(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "O campo 'subjectId' deve ser um número inteiro positivo.",
      });
    }

    if (!isValidId(authorId)) {
      return res.status(400).json({
        success: false,
        message: "O campo 'authorId' deve ser um número inteiro positivo.",
      });
    }

    const [subject, author] = await Promise.all([
      prisma.subject.findUnique({ where: { id: Number(subjectId) } }),
      prisma.user.findUnique({ where: { id: Number(authorId) } }),
    ]);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }
    if (!author) {
      return res.status(404).json({ success: false, message: 'Autor não encontrado.' });
    }

    const question = await prisma.question.create({
      data: {
        enunciado: enunciado.trim(),
        dificuldade: dificuldadeNum,
        respostaCorreta: isNonEmptyString(respostaCorreta) ? respostaCorreta.trim() : null,
        subjectId: Number(subjectId),
        authorId: Number(authorId),
      },
      include: questionInclude,
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error('Erro ao criar questão:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar questão.' });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'O ID informado é inválido.' });
    }

    const question = await prisma.question.findUnique({
      where: { id: parseId(req.params.id) },
      include: questionInclude,
    });

    if (!question) return res.status(404).json({ success: false, message: 'Questão não encontrada' });
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao buscar questão.' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await prisma.question.update({
      where: { id: parseId(req.params.id) },
      data: req.body,
      include: questionInclude,
    });
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao atualizar questão.' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: parseId(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao excluir questão.' });
  }
};