import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { testConnection, initializeDatabase, isDatabaseInitialized, autoInitializeDatabase } from './config/database';
import routes from './routes';
import passport from './config/passport';
import ResponseService from './services/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (profile pictures)
app.use('/uploads', express.static('uploads'));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/', routes);

// Health check endpoint (moved to routes/index.js)

// Database initialization endpoint
app.post('/api/init-db', ResponseService.asyncHandler(async (req: Request, res: Response) => {
  const success = await initializeDatabase();
  if (success) {
    return ResponseService.success(res, null, 'Database initialized successfully');
  } else {
    return ResponseService.error(res, 'Database initialization failed', 500);
  }
}));

// Test database connection endpoint
app.get('/api/test-db', ResponseService.asyncHandler(async (req: Request, res: Response) => {
  const success = await testConnection();
  if (success) {
    return ResponseService.success(res, null, 'Database connection successful');
  } else {
    return ResponseService.error(res, 'Database connection failed', 500);
  }
}));

// Error handling middleware
app.use(ResponseService.errorHandler);

// 404 handler - catch all unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    console.log('Starting AgriConnect Backend Server...');
    
    // Auto-initialize database on startup
    await autoInitializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`AgriConnect Backend server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message);
    process.exit(1);
  }
};

startServer();

export default app;
