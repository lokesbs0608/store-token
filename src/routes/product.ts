import { Router } from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllStoreProducts,
} from "../controllers/products";
import { authorizeStoreOrSuperAdmin } from "../middlewares/auth";

const router = Router();


// Route to create a new product
router.post("/", createProduct);

// Route to get all products
router.get("/", getAllProducts);

// Route to get a single product by ID
router.get("/:id", getProductById);

// Route to update a product by ID
router.put("/:id", authorizeStoreOrSuperAdmin, updateProduct);

// Route to delete a product by ID
router.delete("/:id", authorizeStoreOrSuperAdmin, deleteProduct);

router.get('/storeId/:id', getAllStoreProducts)


export default router;
