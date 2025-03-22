require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// CORS configuration - more permissive for debugging
app.use(cors({
    origin: '*', // Allow all origins for now to debug the issue
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Additional headers for CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    phone: String
});

const voteSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    categoryId: { type: String, required: true },
    nomineeId: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Vote = mongoose.model('Vote', voteSchema);

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findOne({ id: parseInt(code) });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid code' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Vote routes
app.post('/api/vote', authenticateToken, async (req, res) => {
    try {
        const { categoryId, nomineeId } = req.body;
        const userId = req.user.userId;

        console.log(`Vote request received: userId=${userId}, categoryId=${categoryId}, nomineeId=${nomineeId}, type=${typeof nomineeId}`);

        // Check if user has already voted in this category
        const existingVote = await Vote.findOne({ userId, categoryId });
        if (existingVote) {
            // Update existing vote
            console.log(`Updating existing vote for user ${userId} in category ${categoryId}`);
            existingVote.nomineeId = nomineeId;
            existingVote.timestamp = Date.now();
            await existingVote.save();
            console.log(`Vote updated successfully`);
        } else {
            // Create new vote
            console.log(`Creating new vote for user ${userId} in category ${categoryId}`);
            const newVote = await Vote.create({ userId, categoryId, nomineeId });
            console.log(`New vote created with ID: ${newVote._id}`);
        }

        res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
        console.error('Error recording vote:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/votes', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(`Fetching votes for user ${userId}`);
        
        const votes = await Vote.find({ userId });
        console.log(`Found ${votes.length} votes for user ${userId}`);
        
        res.json(votes);
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin routes
app.get('/api/admin/votes', authenticateToken, async (req, res) => {
    try {
        if (req.user.userId !== 999999) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const votes = await Vote.find();
        res.json(votes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin endpoint to reset all votes
app.post('/api/admin/reset-votes', authenticateToken, async (req, res) => {
    try {
        // Verify admin access
        if (req.user.userId !== 999999) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        // Delete all votes from the database
        await Vote.deleteMany({});
        
        console.log('All votes have been reset by admin');
        res.json({ message: 'All votes have been reset successfully' });
    } catch (error) {
        console.error('Error resetting votes:', error);
        res.status(500).json({ message: 'Server error while resetting votes' });
    }
});

// Health check route with CORS verification
app.get('/api/health', (req, res) => {
    // Return the request's origin to help debug CORS
    const requestOrigin = req.headers.origin || 'No origin header';
    const requestMethod = req.method;
    const requestHeaders = req.headers;
    
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: requestOrigin,
            method: requestMethod,
            allowedOrigins: '*',
            headers: requestHeaders
        }
    });
});

// Initialize database with student data
const initializeDatabase = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            const students = require('./js/data').students;
            await User.insertMany(students);
            console.log('Database initialized with student data');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

initializeDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 