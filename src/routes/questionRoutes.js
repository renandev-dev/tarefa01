import { Router } from 'express';
import {
  listQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';

const router = Router();

router.get('/', listQuestions);
router.post('/', createQuestion);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;