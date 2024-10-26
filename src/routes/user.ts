import { Router } from 'express';
import { login, register, verifyOtp, forgotPassword, resetPassword } from '../controllers/user';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('forgot-password', forgotPassword);
router.post('/reset-password', resetPassword)


export default router;
