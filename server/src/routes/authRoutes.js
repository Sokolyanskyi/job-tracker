import express from 'express';
import { register, login, forgotPassword, resetPassword, verifyResetToken } from '../controllers/authController.js';

const router = express.Router();

// Traditional auth
router.post('/register', register);
router.post('/login', login);

// Password reset
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;