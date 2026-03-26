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
import feedbackRoutes from './routes/feedback.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { recordRequest } from './utils/metricsStore.js';

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
const allowedOriginSuffixes = allowedOrigins
  .filter((origin) => origin.startsWith("*."))
  .map((origin) => origin.slice(1)); // keep leading dot for endsWith checks
const allowedOriginExact = allowedOrigins.filter((origin) => !origin.startsWith("*."));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*")) return callback(null, true);
    if (allowedOriginExact.includes(origin)) return callback(null, true);
    if (allowedOriginSuffixes.length) {
      try {
        const { hostname } = new URL(origin);
        if (allowedOriginSuffixes.some((suffix) => hostname.endsWith(suffix))) {
          return callback(null, true);
        }
      } catch (error) {
        return callback(null, false);
      }
    }
    return callback(null, false);
  },
  credentials: true,
};

console.log("CORS allowed origins:", allowedOrigins);
app.use(cors(corsOptions));
// Express 5 + path-to-regexp doesn't accept "*" here; cors middleware already handles preflight.
app.use(morgan('dev'));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    recordRequest({
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'online-course-recommendation-backend' });
});
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Online Course Recommendation API' });
});
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
