import { Router } from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryByStoreId
} from '../controllers/category';
import { authorizeStoreOrSuperAdmin } from '../middlewares/auth';

const router = Router();

// Route for creating a new category
router.post('/', createCategory);

// Route for fetching all categories
router.get('/', getAllCategories);

// Route for fetching a single category by ID
router.get('/:id', authorizeStoreOrSuperAdmin, getCategoryById);

// Route for updating a category by ID
router.put('/:id', authorizeStoreOrSuperAdmin, updateCategory);

// Route for deleting a category by ID
router.delete('/:id', authorizeStoreOrSuperAdmin, deleteCategory);

// Route for fetching a single category by ID
router.get('/storeId/:id', getCategoryByStoreId);

export default router;
