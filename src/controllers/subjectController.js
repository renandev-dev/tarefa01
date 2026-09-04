import prisma from '../config/database.js';
import { publicUser } from '../utils/selects.js';
import { isValidId, isNonEmptyString, parseId } from '../utils/validators.js';

const subjectSelect = {
  id: true,
  nome: true,
  ativa: true,
  createdAt: true,
  updatedAt: true,
  professor: { select: publicUser },
};

export const listSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({ select: subjectSelect });
    res.status(200).json({ success: true, data: subjects, total: subjects.length });
  } catch (error) {
    console.error('Erro ao listar matérias:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao listar matérias.' });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { nome, professorId } = req.body;

    if (!isNonEmptyString(nome)) {
      return res.status(400).json({ success: false, message: "O campo 'nome' é obrigatório." });
    }

    if (!isValidId(professorId)) {
      return res.status(400).json({
        success: false,
        message: "O campo 'professorId' deve ser um número inteiro positivo.",
      });
    }

    const professor = await prisma.user.findUnique({ where: { id: Number(professorId) } });
    if (!professor) {
      return res.status(404).json({ success: false, message: 'Professor não encontrado.' });
    }

    const subject = await prisma.subject.create({
      data: { nome: nome.trim(), professorId: Number(professorId) },
      select: subjectSelect,
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    console.error('Erro ao criar matéria:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar matéria.' });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'O ID informado é inválido.' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseId(req.params.id) },
      select: subjectSelect,
    });

    if (!subject) return res.status(404).json({ success: false, message: 'Matéria não encontrada' });
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao buscar matéria.' });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await prisma.subject.update({
      where: { id: parseId(req.params.id) },
      data: req.body,
      select: subjectSelect,
    });
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    console.error('Erro ao atualizar matéria:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao atualizar matéria.' });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: parseId(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir matéria:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao excluir matéria.' });
  }
};