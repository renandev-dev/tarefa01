import prisma from '../config/database.js';
import { publicUser } from '../utils/selects.js';
import { parseId } from '../utils/validators.js';

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: publicUser });
    res.status(200).json({ success: true, data: users, total: users.length });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao listar usuários.' });
  }
};

export const createUser = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar usuário.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseId(req.params.id) },
      select: publicUser,
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao buscar usuário.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseId(req.params.id) },
      data: req.body,
      select: publicUser,
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao atualizar usuário.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseId(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao excluir usuário.' });
  }
};