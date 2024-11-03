import { Request, Response } from 'express';
import Category from '../models/category'; 

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, description, parentCategory } = req.body;

        // Check if category with the same name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category with the same name already exists' });
        }

        // Create the new category if no duplicate is found
        const newCategory = new Category({ name, description, parentCategory });
        const savedCategory = await newCategory.save();

        return res.status(201).json(savedCategory);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create category' });
    }
};


// Get all categories
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().populate('parentCategory', 'name');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
};

// Get a single category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).populate('parentCategory', 'name');
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.status(200).json(category);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve category' });
    }
};

// Update a category by ID
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, parentCategory } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description, parentCategory },
            { new: true, runValidators: true }
        );
        if (!updatedCategory) {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.status(200).json(updatedCategory);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
};

// Delete a category by ID
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.status(200).json({ message: 'Category deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
