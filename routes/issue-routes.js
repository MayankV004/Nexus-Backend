import express from 'express';
import {
  getIssuesByProject,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue
} from '../controllers/issueControllers.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.use(protectRoute); // Protect all routes in this file

router.get('/project/:projectId', getIssuesByProject); //Get all issues for a project
router.get('/:id', getIssueById); // Get issue by ID

router.post('/', createIssue); //Create new issue
router.put('/:id', updateIssue); // Update issue
router.delete('/:id', deleteIssue); // Delete issue

export default router;