require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
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
    nomineeId: { type: Number, required: true },
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

        // Check if user has already voted in this category
        const existingVote = await Vote.findOne({ userId, categoryId });
        if (existingVote) {
            // Update existing vote
            existingVote.nomineeId = nomineeId;
            existingVote.timestamp = Date.now();
            await existingVote.save();
        } else {
            // Create new vote
            await Vote.create({ userId, categoryId, nomineeId });
        }

        res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/votes', authenticateToken, async (req, res) => {
    try {
        const votes = await Vote.find({ userId: req.user.userId });
        res.json(votes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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