// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const cors = require('cors');
const { Pool } = require('pg');
const app = express();

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // set in .env
});

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true, // Allow credentials like cookies, authorization headers
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/patients', require('./routes/patientRoutes.js'));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
