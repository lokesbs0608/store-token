import mongoose, { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Interface representing a user document
interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    otp?: string;
    otpExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    verified: Boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User schema
const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'store_admin'],
            default: 'user',
        },
        otp: String,
        otpExpires: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        verified: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
);

// Hash the password before saving the user
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare input password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create the User model
const User = model<IUser>('User', userSchema);

export default User;
