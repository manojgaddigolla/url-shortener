require('dotenv').config();

// Validate required environment variables at startup
if (!process.env.BASE_URL || process.env.BASE_URL.trim() === '') {
  console.error('ERROR: BASE_URL environment variable is not set or is empty');
  console.error('Please set BASE_URL in your .env file (e.g., BASE_URL=http://localhost:5000)');
  process.exit(1);
}

const errorHandler = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { clerkMiddleware } = require('@clerk/express');
const app = express();

// Trust proxy - enable if behind a reverse proxy (nginx, AWS ELB, Heroku, etc.)
// This allows express-rate-limit to correctly identify client IPs from X-Forwarded-For header
// Set to the number of proxy hops or true if you trust all proxies
app.set('trust proxy', 1);

connectDB();

// Add security headers (disable CSP/COEP to avoid breaking Clerk and frontend assets)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Enable CORS with restricted origins
const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  process.env.BASE_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In dev mode, be lenient to avoid unexpected friction
    if (process.env.NODE_ENV !== 'production') {
       return callback(null, true);
    }

    callback(new Error('CORS policy violation: Origin not allowed'));
  },
  credentials: true
}));

// Webhook route needs raw body, so mount it before express.json()
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(clerkMiddleware());

const linksRoutes = require('./routes/links');
app.use('/api/links', linksRoutes);

const urlRoutes = require('./routes/urls');
app.use('/api/short', urlRoutes);

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));