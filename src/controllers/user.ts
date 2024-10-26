import { Request, Response } from "express";
import User from "../models/users";
import crypto from "crypto";
import { sendOtpEmail } from "../config/email";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Register user and send OTP for email verification
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires: new Date(Date.now() + 2 * 60 * 1000),
        });
        await user.save();

        await sendOtpEmail(email, otp);
        res.status(201).json({ message: "OTP sent to email for verification" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// Verify OTP and activate user
// Verify OTP and activate user
export const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    // Basic validation for required fields
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP matches and is not expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Clear OTP fields and save user
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res
            .status(200)
            .json({ message: "OTP verified successfully, user activated" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Find the user by email, including the password field for verification
        const user = await User.findOne({ email, archive: false });

        if (!user) {
            return res.status(400).send({ error: "Invalid login credentials" });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: "Invalid login credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role, email: user?.email },
            process?.env?.SECRET_KEY || "your-secret-key"
        );

        // Create a user object without the password field
        const userWithoutPassword = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Add other fields you want to include
        };

        // Send the user object without password and the token
        res.send({ user: userWithoutPassword, token });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ error: "Server error", details: error.message });
        }
    }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);
        await user.save();

        // Send reset token via email
        await sendOtpEmail(email, otp);
        res
            .status(200)
            .json({ message: "Password reset token sent", token: resetToken });
    } catch (error) {
        res.status(500).json({ message: "Error requesting password reset", error });
    }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword, otp } = req.body;

    try {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        // Check if OTP matches and is not expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Hash the new password before saving
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
};
