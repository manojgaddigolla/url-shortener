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
const app = express();

// Trust proxy - enable if behind a reverse proxy (nginx, AWS ELB, Heroku, etc.)
// This allows express-rate-limit to correctly identify client IPs from X-Forwarded-For header
// Set to the number of proxy hops or true if you trust all proxies
app.set('trust proxy', 1);

connectDB();
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const linksRoutes = require('./routes/links');
app.use('/api/links', linksRoutes);

const urlRoutes = require('./routes/urls');
app.use('/api/short', urlRoutes);

const indexRoutes = require('./routes/index');
app.get('/', indexRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));