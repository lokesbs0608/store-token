import { Router } from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/category';
import { authorizeStoreOrSuperAdmin } from '../middlewares/auth';

const router = Router();

// Route for creating a new category
router.post('/', authorizeStoreOrSuperAdmin, createCategory);

// Route for fetching all categories
router.get('/', getAllCategories);

// Route for fetching a single category by ID
router.get('/:id', authorizeStoreOrSuperAdmin, getCategoryById);

// Route for updating a category by ID
router.put('/:id', authorizeStoreOrSuperAdmin, updateCategory);

// Route for deleting a category by ID
router.delete('/:id', authorizeStoreOrSuperAdmin, deleteCategory);

export default router;
