import express from 'express';
import * as auth from '../controllers/authControllers.js';
import { protectRoute } from '../middleware/auth.js';
const router = express.Router();

router.post('/login',auth.login)
router.post('/register',auth.signUp)
router.post('/logout', protectRoute ,auth.logout);

router.post('/verify-email', auth.verifyEmail);
router.post('/resend-otp', auth.resendOtp);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);


export default router;