require('dotenv').config()

import express from 'express';
import cors from 'cors';  // Import cors

import connectDB from './config/db';
import userRoutes from './routes/user';
import categoryRoutes from './routes/category';
import productsRoutes from './routes/product';
import storeRoutes from './routes/store';



const app = express();

// Configure CORS options
const corsOptions = {
    origin: '*',  // Allow all origins, you can specify allowed origins if needed
    methods: 'GET,POST,PUT,DELETE',  // Allowed methods
    allowedHeaders: 'Content-Type,Authorization',  // Allowed headers
};

// Use CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

connectDB();



app.use('/api/users', userRoutes);  // Use '/api/users' for user routes
app.use('/api/category', categoryRoutes);  // Use '/api/category' for category routes
app.use('/api/product', productsRoutes);  // Use '/api/product' for product routes
app.use('/api/store', storeRoutes);  // Use '/api/store' for store routes


const PORT = process.env.PORT || 8877;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
