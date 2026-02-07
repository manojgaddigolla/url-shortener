require('dotenv').config();

const connectDB = require('./config/db');
const express = require('express');
const app = express();

connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));