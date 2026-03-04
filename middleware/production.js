const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Security and performance middleware for production
function setupProductionMiddleware(app) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isQa = process.env.NODE_ENV === 'qa';
  
  // Security headers (production only)
  if (isProduction && process.env.HELMET_ENABLED === 'true') {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
  }
  
  // Compression (production and qa)
  if ((isProduction || isQa) && process.env.COMPRESSION_ENABLED === 'true') {
    app.use(compression());
  }
  
  // Rate limiting
  const limitWindow = isProduction ? 15 : 60; // minutes
  const limitMax = parseInt(process.env.API_RATE_LIMIT) || (isProduction ? 50 : 100);
  
  const limiter = rateLimit({
    windowMs: limitWindow * 60 * 1000, // minutes
    max: limitMax,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', limiter);
}

module.exports = { setupProductionMiddleware };
