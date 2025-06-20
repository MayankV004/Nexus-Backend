import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getUserProfile } from '../controllers/userControllers.js';
const router = express.Router();

router.get('/profile' , protectRoute , getUserProfile)

export default router;