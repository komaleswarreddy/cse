const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB Connection
let cachedDb = null;

// Student data
const students = [
    { id: 123456, name: "NAKSHATRA", phone: "" },
    { id: 234567, name: "S.V. POOJITHA", phone: "" },
    { id: 345678, name: "CHUSMALATHA", phone: "" },
    { id: 456789, name: "HARSHITHA", phone: "" },
    { id: 567890, name: "SHABHANA", phone: "" },
    { id: 678901, name: "PARDHU", phone: "9121828939" },
    { id: 789012, name: "SRINU", phone: "" },
    { id: 890123, name: "BALU", phone: "" },
    { id: 901234, name: "MOULI", phone: "" },
    { id: 112233, name: "NAVANEETH", phone: "" },
    { id: 223344, name: "ROHITH", phone: "" },
    { id: 334455, name: "DIWAKAR", phone: "" },
    { id: 445566, name: "MAHESH", phone: "" },
    { id: 556677, name: "GANESH", phone: "" },
    { id: 667788, name: "YUVARAJ", phone: "6281523252" },
    { id: 778899, name: "UMA MANIKANTA", phone: "" },
    { id: 889900, name: "SYAM", phone: "8179249607" },
    { id: 998877, name: "PRASHANTH", phone: "" },
    { id: 887766, name: "BASHA", phone: "" },
    { id: 776655, name: "DHARANESHWAR", phone: "" },
    { id: 665544, name: "RAKESH", phone: "" },
    { id: 554433, name: "ANUSHA", phone: "" },
    { id: 443322, name: "CH. VAISHNAVI", phone: "" },
    { id: 332211, name: "VIJAYALAKSHMI", phone: "" },
    { id: 221100, name: "ANJALI", phone: "" },
    { id: 123789, name: "CHARISHMA", phone: "" },
    { id: 234890, name: "KOMAL", phone: "7997696708" },
    { id: 345901, name: "SRIBABU", phone: "" },
    { id: 456012, name: "LAKSHMAN", phone: "" },
    { id: 567123, name: "VIJJI", phone: "" },
    { id: 678234, name: "R. VYSHNAVI", phone: "" },
    { id: 789345, name: "SUSI", phone: "" },
    { id: 890456, name: "N. LIKHITHA (NAINI)", phone: "" },
    { id: 901567, name: "NAGA LIKHITHA", phone: "" },
    { id: 112678, name: "SAMEERAJA", phone: "" },
    { id: 223789, name: "SRAVANI", phone: "" },
    { id: 334890, name: "JAHNAVI", phone: "" },
    { id: 445901, name: "SRI MANIKANTA", phone: "" },
    { id: 556012, name: "HEMANTH", phone: "" },
    { id: 667123, name: "BINDHU SRI", phone: "" },
    { id: 778234, name: "ISHYA", phone: "" },
    { id: 889345, name: "MANASA", phone: "" },
    { id: 900456, name: "SOWMYA SRI", phone: "" },
    { id: 111567, name: "SHANMUKH", phone: "" },
    { id: 222678, name: "RAM SAI ROHITH", phone: "" },
    { id: 333789, name: "TEJA SRI", phone: "" },
    { id: 444890, name: "SUSMITHA", phone: "" },
    { id: 555901, name: "VIJAYA SRI", phone: "" },
    { id: 666012, name: "SNEHALATHA", phone: "" },
    { id: 777123, name: "LAHARI", phone: "" },
    { id: 888234, name: "INDHU JOY", phone: "" },
    { id: 999345, name: "RENU SRI", phone: "" },
    { id: 123567, name: "SRAVAN", phone: "" },
    { id: 234678, name: "MOTHILAL", phone: "" },
    { id: 345789, name: "KOWSHIK", phone: "" },
    { id: 456890, name: "GOPI", phone: "" },
    { id: 567901, name: "MALLIKARJUN", phone: "" },
    { id: 678012, name: "V. POOJITHA", phone: "" },
    { id: 789123, name: "JOSHNA", phone: "" },
    { id: 890234, name: "VENNELA SRI", phone: "" }
];

// Add admin user
students.push({ id: 999999, name: "Admin", phone: "" });

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
        cachedDb = connection;

        // Initialize database with students if empty
        const count = await User.countDocuments();
        if (count === 0) {
            console.log('Initializing database with student data...');
            await User.insertMany(students);
            console.log('Database initialized successfully');
        }

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
            
            try {
                const user = await User.findOne({ id: parseInt(code) });
                console.log('Found user:', user);
                
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
            } catch (error) {
                console.error('Login error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ message: 'Server error during login', error: error.message })
                };
            }
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