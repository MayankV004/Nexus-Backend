import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/projectControllers.js';

const router = express.Router();

router.get('/', getAllProjects); //Get all projects
router.get('/:id', getProjectById); //Get project by ID

router.post('/', createProject); //Create new project
router.put('/:id', updateProject); // Update project
router.delete('/:id', deleteProject); //Delete project

router.post('/:id/members', addMember); // Add member to project
router.delete('/:id/members/:memberId', removeMember); // Remove member from project

export default router;