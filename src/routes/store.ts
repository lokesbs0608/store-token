import { Router } from "express";
import {
    createStore,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore,
    verifyAndGenerateQRCode,
} from "../controllers/store";
import {
    StoreAuthMiddleware,
    SuperAdminAuthMiddleware,
} from "../middlewares/auth";

const router = Router();

// Routes for store CRUD operations
router.post("/", createStore);
router.get("/", getAllStores);
router.get("/:id", getStoreById);
router.put("/:id", StoreAuthMiddleware, updateStore);
router.delete("/:id", SuperAdminAuthMiddleware, deleteStore);
// Route for verifying store and generating QR code
router.post('/:storeId/verify-and-generate-qr', verifyAndGenerateQRCode);

export default router;
