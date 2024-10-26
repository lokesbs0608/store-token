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

        // Create a new user instance without saving yet
        const user = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires: new Date(Date.now() + 2 * 60 * 1000), // OTP expires in 2 minutes
        });

        // Attempt to send the OTP email
        await sendOtpEmail(email, otp);

        // Save user only after the email is sent successfully
        await user.save();

        res.status(201).json({ message: "OTP sent to email for verification" });
    } catch (error) {
        console.error("Registration error:", error);

        // Assert `error` as `Error` to access its `message` property
        if (error instanceof Error) {
            // Check for specific error types
            if ((error as any).code === 11000) { // MongoDB duplicate key error for unique fields
                return res.status(409).json({ message: "User with this email already exists" });
            }
            res.status(500).json({ message: "Error registering user", error: error.message });
        } else {
            res.status(500).json({ message: "Unknown error during registration" });
        }
    }
};

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

        // Check if the user is already verified
        if (user.verified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // Check if OTP or expiration fields are missing, indicating they were already used
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP has already been verified or expired" });
        }

        // Check if OTP has expired
        if (user.otpExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Clear OTP fields, set user as verified, and save user
        user.otp = undefined;
        user.otpExpires = undefined;
        user.verified = true;
        await user.save();

        return res.status(200).json({ message: "OTP verified successfully, user activated" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
}
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

// Resend OTP
export const resendOtp = async (req: Request, res: Response) => {
    const { email } = req.body;

    // Basic validation for required fields
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a new OTP and set expiration time
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP expires in 2 minutes

        // Save the user data with the new OTP
        await user.save();

        // Send the OTP email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP resent to email" });
    } catch (error) {
        console.error("Error resending OTP:", error);

        // Check error type and respond accordingly
        if (error instanceof Error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        } else {
            res.status(500).json({ message: "Unknown error during OTP resend" });
        }
    }
};