import { Request, Response } from 'express';
import StoreModel from '../models/store';

// Create a new store
export const createStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeData = req.body;
        const newStore = new StoreModel(storeData);
        const savedStore = await newStore.save();
        res.status(201).json(savedStore);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to create store' });
        }
    }
};

// Get all stores
export const getAllStores = async (req: Request, res: Response): Promise<void> => {
    try {
        const stores = await StoreModel.find();
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
};

// Get a single store by ID
export const getStoreById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const store = await StoreModel.findById(id);
        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        res.status(200).json(store);
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            res.status(400).json({ error: 'Invalid store ID' });
        } else {
            res.status(500).json({ error: 'Failed to fetch store' });
        }
    }
};

// Update a store by ID
export const updateStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedStore = await StoreModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedStore) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        res.status(200).json(updatedStore);
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            res.status(400).json({ error: 'Invalid store ID' });
        } else {
            res.status(500).json({ error: 'Failed to update store' });
        }
    }
};

// Delete a store by ID
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedStore = await StoreModel.findByIdAndDelete(id);
        if (!deletedStore) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        res.status(204).send(); // No content to send back for delete
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            res.status(400).json({ error: 'Invalid store ID' });
        } else {
            res.status(500).json({ error: 'Failed to delete store' });
        }
    }
};
