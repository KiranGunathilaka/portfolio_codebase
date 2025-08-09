const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Trust proxy for accurate client IPs
app.set('trust proxy', 1);

// Compression middleware
app.use(compression());

// Security middleware with enhanced configuration
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "*.cloudinary.com"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "*.cloudinary.com"],
      frameSrc: ["'none'"],
    },
  },
}));

// IMPROVED CORS Configuration with enhanced security
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://192.168.1.5:8080',
  'http://127.0.0.1:8080',
  process.env.FRONTEND_URL,
  // Add production domains here
  'https://kirangunathilaka.online',
  'https://www.kirangunathilaka.online',
  'https://kirangunathilaka.netlify.app',  //
].filter(Boolean); // Remove any undefined values

// Define PUBLIC endpoints (no sensitive data - anyone can access)
const publicEndpoints = [
  '/api/health',
  '/api/status'
];

// Define PROTECTED endpoints (sensitive data - strict CORS only)
const protectedEndpoints = [
  '/api/auth',
  '/api/blogs',
  '/api/projects',
  '/api/milestones',
  '/api/skills',
  '/api/upload'
];

// Custom CORS middleware for selective access
app.use((req, res, next) => {
  const requestPath = req.path;
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    requestPath === endpoint || requestPath.startsWith(endpoint + '/')
  );
  
  if (isPublicEndpoint) {
    // PUBLIC ENDPOINTS - Allow all origins (no sensitive data here)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24h
    
    // Handle preflight requests for public endpoints
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    console.log(`✅ Public endpoint accessed: ${req.method} ${requestPath} from ${req.headers.origin || 'direct'}`);
    return next();
  }
  
  // Check if this is a protected endpoint
  const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
    requestPath.startsWith(endpoint)
  );
  
  if (isProtectedEndpoint) {
    // PROTECTED ENDPOINTS - Strict CORS enforcement
    const origin = req.headers.origin;
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      if (!origin || !allowedOrigins.includes(origin)) {
        console.log(`🚫 CORS blocked preflight for protected endpoint: ${requestPath} from ${origin || 'no-origin'}`);
        return res.status(403).json({ error: 'CORS: Origin not allowed for protected endpoints' });
      }
      
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      return res.sendStatus(200);
    }
    
    // For actual requests to protected endpoints - BLOCK REQUESTS WITHOUT VALID ORIGIN
    if (!origin || !allowedOrigins.includes(origin)) {
      console.log(`🚫 CORS blocked protected endpoint: ${req.method} ${requestPath} from ${origin || 'no-origin'}`);
      return res.status(403).json({ 
        error: 'CORS: Access to protected endpoints denied',
        message: 'This endpoint contains sensitive data and is restricted to authorized domains only.'
      });
    }
    
    // Set CORS headers for allowed origins
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');
    
    console.log(`✅ Protected endpoint accessed: ${req.method} ${requestPath} from ${origin}`);
    return next();
  }
  
  // For any other endpoints (like /api/debug), apply default CORS but more restrictive
  const origin = req.headers.origin;
  
  // In production, block all other endpoints from unauthorized origins
  if (process.env.NODE_ENV === 'production' && (!origin || !allowedOrigins.includes(origin))) {
    console.log(`🚫 CORS blocked other endpoint in production: ${req.method} ${requestPath} from ${origin || 'no-origin'}`);
    return res.status(403).json({ 
      error: 'CORS: Access denied',
      message: 'Access to this endpoint is restricted.'
    });
  }
  
  // In development, allow no-origin requests
  if (!origin && process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
  
  next();
});

// Enhanced rate limiting with different limits for different endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// General rate limiting
app.use(createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
));

// Stricter rate limiting for auth endpoints
app.use('/api/auth', createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 auth requests per window
  'Too many authentication attempts, please try again later.'
));

// Upload rate limiting
app.use('/api/upload', createRateLimit(
  5 * 60 * 1000, // 5 minutes
  20, // 20 uploads per window
  'Too many upload requests, please try again later.'
));

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(
      `[${new Date().toISOString()}] ${logLevel} ${req.method} ${req.originalUrl} ` +
      `${res.statusCode} ${duration}ms - ${req.ip}`
    );
  });
  
  next();
});

app.use((req, res, next) => {
  const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
    req.path.startsWith(endpoint)
  );
  
  if (isProtectedEndpoint) {
    // Extra security headers for sensitive endpoints
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  next();
});

// Static files with cache headers
app.use('/uploads', express.static('uploads', {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));



// Database connection with enhanced options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true, // Retry failed writes
      writeConcern: {
        w: 'majority'
      }
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/upload', require('./routes/upload'));

// Health check with detailed status
app.get('/api/health', async (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      cloudinary: 'unknown'
    }
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthStatus.services.database = 'connected';
    } else {
      healthStatus.services.database = 'disconnected';
      healthStatus.status = 'DEGRADED';
    }
  } catch (error) {
    healthStatus.services.database = 'error';
    healthStatus.status = 'DEGRADED';
  }

  // Check Cloudinary configuration
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
  healthStatus.services.cloudinary = cloudinaryConfigured ? 'configured' : 'not_configured';

  const statusCode = healthStatus.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'Portfolio Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      blogs: '/api/blogs',
      projects: '/api/projects',
      milestones: '/api/milestones',
      skills: '/api/skills',
      upload: '/api/upload'
    }
  });
});

// Debug endpoint to check CORS origins (only in development)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug', (req, res) => {
    res.json({
      allowedOrigins,
      publicEndpoints,
      protectedEndpoints,
      requestOrigin: req.headers.origin,
      frontendUrl: process.env.FRONTEND_URL,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      headers: req.headers,
      corsPolicy: {
        public: "Anyone can access health/status endpoints",
        protected: "Only allowed origins can access data endpoints"
      }
    });
  });
}
// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value'
    });
  }
  
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation'
    });
  }

  // Default error response
  const statusCode = error.status || error.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : error.message,
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log('404 - API route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/health',
      '/api/status',
      '/api/auth/*',
      '/api/blogs/*',
      '/api/projects/*',
      '/api/milestones/*',
      '/api/skills/*',
      '/api/upload/*'
    ]
  });
});

// Catch-all handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'This is a backend API server. Please use /api/* endpoints.'
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Graceful shutdown starting...`);
  
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📱 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Health check: http://localhost:${PORT}/api/health
🔧 API Status: http://localhost:${PORT}/api/status
📋 Allowed CORS origins: ${allowedOrigins.join(', ')}
${process.env.NODE_ENV === 'development' ? `🐛 Debug info: http://localhost:${PORT}/api/debug` : ''}
  `);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app;