import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/users"; // Adjust the path as needed
import dotenv from "dotenv";
dotenv.config();

interface JwtPayload {
    userId: string;
    role: string;
    email: string;
}

export const StoreAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).send({ error: "Please authenticate." });
    }

    try {
        const decoded = jwt.verify(
            token,
            process?.env?.SECRET_KEY || "your-secret-key"
        ) as JwtPayload;

        // Check if role is 'store_admin'
        if (decoded.role !== "store_admin") {
            return res.status(403).send({ error: "Access denied: Admins only." });
        }

        // Find the user by email and check if verified
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).send({ error: "User not found." });
        }

        if (!user.verified) {
            return res.status(403).send({ error: "User account is not verified." });
        }

        // Attach user data to the request and proceed
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).send({ error: "Please authenticate." });
    }
};



export const SuperAdminAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).send({ error: "Please authenticate." });
    }

    try {
        const decoded = jwt.verify(
            token,
            process?.env?.SECRET_KEY || "your-secret-key"
        ) as JwtPayload;

        // Check if role is 'store_admin'
        if (decoded.role !== "admin") {
            return res.status(403).send({ error: "Access denied: Admins only." });
        }

        // Find the user by email and check if verified
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).send({ error: "User not found." });
        }

        if (!user.verified) {
            return res.status(403).send({ error: "User account is not verified." });
        }

        // Attach user data to the request and proceed
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).send({ error: "Please authenticate." });
    }
};



export const authorizeStoreOrSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Attempt StoreAuthMiddleware
        await StoreAuthMiddleware(req, res, (err: any) => {
            if (!err) return next();  // If successful, continue to the next handler

            // Attempt SuperAdminAuthMiddleware if StoreAuthMiddleware failed
            SuperAdminAuthMiddleware(req, res, (err: any) => {
                if (!err) return next();  // If successful, continue to the next handler
                
                // If both fail, respond with an unauthorized error
                res.status(403).json({ error: 'Access denied. You need to be authorized as a store admin or super admin.' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during authorization' });
    }
};