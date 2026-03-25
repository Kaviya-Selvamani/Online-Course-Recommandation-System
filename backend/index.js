import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import recommendationRoutes from './routes/recommendations.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// Allow local dev by default; override in production via CORS_ORIGINS (comma-separated).
// Supports "*" to allow any origin (useful for quick troubleshooting).
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
};

console.log('CORS allowed origins:', allowedOrigins);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
