import { Request, Response } from "express";
import Product from "../models/product";
import Store from "../models/store";
import Category from "../models/category";

// Create a new product
export const createProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { name, description, price, category, images, stock } = req.body;
        if (!name || !price || !category) {
            return res
                .status(400)
                .json({ error: "Name, price, and category are required fields." });
        }
        const newProduct = new Product({
            ...req.body,
            name,
            description,
            price,
            category,
            images,
            stock,
        });
        const savedProduct = await newProduct.save();
        return res.status(201).json(savedProduct);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ error: "Failed to create product", details: error.message });
        }
        return res.status(500).json({ error: "Failed to create product" });
    }
};

// Get all products
export const getAllProducts = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ error: "Failed to fetch products", details: error.message });
        }
        return res.status(500).json({ error: "Failed to fetch products" });
    }
};

// Get a single product by ID
export const getProductById = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === "CastError") {
                return res.status(400).json({ error: "Invalid product ID format" });
            }
            return res
                .status(500)
                .json({ error: "Failed to fetch product", details: error.message });
        }
        return res.status(500).json({ error: "Failed to fetch product" });
    }
};

// Update a product by ID
export const updateProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { name, description, price, category, images, stock } = req.body;
        if (!name || !price || !category) {
            return res
                .status(400)
                .json({ error: "Name, price, and category are required fields." });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, images, stock },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(updatedProduct);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === "CastError") {
                return res.status(400).json({ error: "Invalid product ID format" });
            }
            return res
                .status(500)
                .json({ error: "Failed to update product", details: error.message });
        }
        return res.status(500).json({ error: "Failed to update product" });
    }
};

// Delete a product by ID
export const deleteProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === "CastError") {
                return res.status(400).json({ error: "Invalid product ID format" });
            }
            return res
                .status(500)
                .json({ error: "Failed to delete product", details: error.message });
        }
        return res.status(500).json({ error: "Failed to delete product" });
    }
};
// Get all store products
export const getAllStoreProducts = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const store = await Store.findById(req.params.id);
        const products = await Product.find({ store_id: req.params.id });
        const category = await Category.find({ store_id: req.params.id });
        return res.status(200).json({ products, store, category });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ error: "Failed to fetch products", details: error.message });
        }
        return res.status(500).json({ error: "Failed to fetch products" });
    }
};
