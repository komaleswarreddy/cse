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
        console.log(`Login attempt with code: ${code}`);
        
        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }
        
        const parsedCode = parseInt(code);
        console.log(`Parsed code as number: ${parsedCode}`);
        
        // Special case for admin code
        if (parsedCode === 999999) {
            console.log('Admin login detected');
            // Create admin user if not exists in database
            const adminUser = { id: 999999, name: "ADMIN", phone: "" };
            const token = jwt.sign({ userId: adminUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.json({ token, user: adminUser });
        }
        
        // Try to find user
        const user = await User.findOne({ id: parsedCode });
        console.log(`User lookup result: ${user ? 'Found' : 'Not found'}`);
        
        if (!user) {
            console.log(`No user found with id: ${parsedCode}`);
            return res.status(401).json({ message: 'Invalid code' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log(`Login successful for user: ${user.name}`);
        res.json({ token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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

// Route to manually initialize database (for troubleshooting)
app.get('/api/init-db', async (req, res) => {
    try {
        console.log('Manual database initialization requested');
        await initializeDatabase();
        
        // Count users after initialization
        const count = await User.countDocuments();
        const sampleUsers = await User.find().limit(5);
        
        res.json({
            success: true,
            message: 'Database initialization triggered',
            userCount: count,
            sampleUsers: sampleUsers
        });
    } catch (error) {
        console.error('Error in manual database initialization:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error initializing database', 
            error: error.message 
        });
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

// Route to check user data
app.get('/api/check-users', async (req, res) => {
    try {
        // Count total users
        const count = await User.countDocuments();
        
        // Get sample users
        const users = await User.find().limit(10);
        
        // Check if specific test users exist
        const testUsers = [
            await User.findOne({ id: 103456 }),  // NAKSHATRA
            await User.findOne({ id: 234567 }),  // S.V. POOJITHA
            await User.findOne({ id: 999999 })   // ADMIN
        ];
        
        res.json({
            success: true,
            userCount: count,
            sampleUsers: users,
            testUsers: testUsers.map(user => user ? { id: user.id, name: user.name } : null)
        });
    } catch (error) {
        console.error('Error checking users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking users', 
            error: error.message 
        });
    }
});

// Initialize database with student data
const initializeDatabase = async () => {
    try {
        const count = await User.countDocuments();
        console.log(`Current user count in database: ${count}`);
        
        if (count === 0) {
            console.log('No users found in database. Initializing with student data...');
            
            // For safety, let's define some basic students in case data.js fails to load
            let students = [];
            
            try {
                // Try to load from data.js
                const dataModule = require('./js/data');
                if (dataModule && Array.isArray(dataModule.students) && dataModule.students.length > 0) {
                    students = dataModule.students;
                    console.log(`Loaded ${students.length} students from data.js`);
                } else {
                    console.warn('data.js did not contain valid students array');
                }
            } catch (dataError) {
                console.error('Error loading data.js:', dataError);
                
                // Fallback data in case data.js is not available
                students = [
                    { id: 103456, name: "NAKSHATRA", phone: "8008647735" },
                    { id: 234567, name: "S.V. POOJITHA", phone: "9347871250" },
                    { id: 345678, name: "CHUSMALATHA", phone: "9491971357" },
                    { id: 999999, name: "ADMIN", phone: "" }
                ];
                console.log('Using fallback student data');
            }
            
            if (students.length > 0) {
                // Make sure admin is in the list
                if (!students.some(s => s.id === 999999)) {
                    students.push({ id: 999999, name: "ADMIN", phone: "" });
                }
                
                // Insert all students into database
                await User.insertMany(students);
                console.log(`Inserted ${students.length} students into database`);
                
                // Verify data was inserted
                const newCount = await User.countDocuments();
                console.log(`New user count in database: ${newCount}`);
            } else {
                console.error('No student data available to initialize database');
            }
        } else {
            console.log(`Database already contains ${count} users, skipping initialization`);
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Make sure database is initialized after server starts
    try {
        console.log('Running database initialization...');
        await initializeDatabase();
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Error during startup database initialization:', error);
    }
}); 