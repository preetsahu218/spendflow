import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import prisma from './config/prisma';

export const app = express();

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost dev and configured cors origin
      if (!origin || origin.includes('localhost') || origin === config.corsOrigin) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/testing, can be restricted in prod
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', routes);

// Serve frontend static files in production if built
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler for unmatched API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server if not running inside test suite
if (config.nodeEnv !== 'test') {
  const server = app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🚀 Expense Tracker Server is running!`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`=========================================`);
  });

  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Process exited.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default app;
