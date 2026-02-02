const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../config.env') });

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

app.get('/', (req, res) => {
    res.send('Cinema booking API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
