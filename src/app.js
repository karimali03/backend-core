require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const errorHandler = require('./middlewares/error.handler');
const apiRoutes = require('./api'); // Main router for all API endpoints

const app = express();

// 3rd party Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Template Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// API Routes
app.use('/api/v1', apiRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;