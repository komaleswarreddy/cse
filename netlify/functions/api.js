const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB Connection
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
        cachedDb = connection;
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

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

let User = mongoose.models.User || mongoose.model('User', userSchema);
let Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

// Helper function to verify JWT token
const verifyToken = (authHeader) => {
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('Token verification error:', err);
        throw new Error('Invalid token');
    }
};

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'no-cache' // Prevent caching
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    try {
        await connectToDatabase();
        const path = event.path.replace('/.netlify/functions/api', '');
        const body = JSON.parse(event.body || '{}');

        console.log(`Processing ${event.httpMethod} request to ${path}`);

        // Login route
        if (path === '/login' && event.httpMethod === 'POST') {
            const { code } = body;
            console.log('Login attempt for code:', code);
            
            const user = await User.findOne({ id: parseInt(code) });
            
            if (!user) {
                console.log('Invalid login attempt for code:', code);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ message: 'Invalid code' })
                };
            }

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            console.log('Successful login for user:', user.name);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ token, user })
            };
        }

        // Protected routes - verify token
        let userData;
        try {
            userData = verifyToken(event.headers.authorization);
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: error.message })
            };
        }

        // Vote routes
        if (path === '/vote' && event.httpMethod === 'POST') {
            const { categoryId, nomineeId } = body;
            const userId = userData.userId;

            console.log(`Processing vote - User: ${userId}, Category: ${categoryId}, Nominee: ${nomineeId}`);

            const existingVote = await Vote.findOne({ userId, categoryId });
            if (existingVote) {
                existingVote.nomineeId = nomineeId;
                existingVote.timestamp = Date.now();
                await existingVote.save();
                console.log('Updated existing vote');
            } else {
                await Vote.create({ userId, categoryId, nomineeId });
                console.log('Created new vote');
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Vote recorded successfully' })
            };
        }

        // Get user votes
        if (path === '/votes' && event.httpMethod === 'GET') {
            console.log(`Fetching votes for user: ${userData.userId}`);
            const votes = await Vote.find({ userId: userData.userId });
            console.log(`Found ${votes.length} votes for user`);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(votes)
            };
        }

        // Admin routes
        if (path === '/admin/votes' && event.httpMethod === 'GET') {
            if (userData.userId !== 999999) {
                console.log('Unauthorized admin access attempt from user:', userData.userId);
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ message: 'Admin access required' })
                };
            }
            
            console.log('Fetching all votes for admin');
            const votes = await Vote.find().sort({ timestamp: -1 });
            console.log(`Found ${votes.length} total votes`);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(votes)
            };
        }

        console.log('Route not found:', path);
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Route not found' })
        };
    } catch (error) {
        console.error('Server error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error', error: error.message })
        };
    }
}; 