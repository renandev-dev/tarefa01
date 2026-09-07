import { Router } from 'express';
import {
  listSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';

const router = Router();

router.get('/', listSubjects);
router.post('/', createSubject);
router.get('/:id', getSubjectById);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;