import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use the appropriate email service
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject: 'OTP Verification',
    text: `Your OTP is ${otp}. It will expire in 2 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};
