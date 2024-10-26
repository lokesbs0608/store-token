import { Router } from 'express';
import { login, register, verifyOtp, forgotPassword, resetPassword, resendOtp } from '../controllers/user';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('forgot-password', forgotPassword);
router.post('/reset-password', resetPassword)
router.post('/resend-otp', resendOtp)


export default router;
