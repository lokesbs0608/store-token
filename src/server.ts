require('dotenv').config()

import express from 'express';
import cors from 'cors';  // Import cors

import connectDB from './config/db';
import userRoutes from './routes/user';
import categoryRoutes from './routes/category';


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
app.use('/api/category', categoryRoutes);  // Use '/api/users' for user routes


const PORT = process.env.PORT || 8877;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
