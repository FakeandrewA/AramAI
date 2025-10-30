import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

import {app, server} from './lib/socket.js';
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_DEV_URI;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Root route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
