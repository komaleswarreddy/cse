const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Get JWT secret from environment or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'cse6-poll-system-default-secret-key';

// In-memory storage for votes when MongoDB is not available
let inMemoryVotes = [];

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
    if (cachedDb && mongoose.connection.readyState === 1) {
        console.log('Using cached database connection');
        return cachedDb;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI exists' : 'URI is missing');
        
        // Close any existing connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        
        let connection;
        
        // If no MongoDB URI is provided, use in-memory MongoDB
        if (!process.env.MONGODB_URI) {
            console.log('No MongoDB URI provided, using in-memory storage');
            // We'll use local storage approach instead of trying to connect to MongoDB
            cachedDb = { ready: true };
            return cachedDb;
        }

        connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('MongoDB connected successfully');
        cachedDb = connection;

        // Define models before checking count
        const userSchema = new mongoose.Schema({
            id: { type: Number, required: true, unique: true },
            name: { type: String, required: true },
            phone: String
        });

        // Clear existing model if it exists
        mongoose.deleteModel(/^User$/);
        const User = mongoose.model('User', userSchema);

        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const userCollectionExists = collections.some(col => col.name === 'users');
        
        if (!userCollectionExists) {
            console.log('Users collection does not exist, creating and initializing...');
            try {
                await User.createCollection();
                await User.insertMany(students);
                console.log('Successfully initialized database with', students.length, 'students');
            } catch (initError) {
                console.error('Error during student data initialization:', initError);
                if (initError.code === 11000) {
                    console.log('Duplicate key error, attempting to drop and recreate collection...');
                    await mongoose.connection.db.dropCollection('users');
                    await User.insertMany(students);
                    console.log('Successfully reinitialized database after dropping collection');
                } else {
                    throw initError;
                }
            }
        } else {
            // Check if collection is empty
            const count = await User.countDocuments();
            console.log('Current user count in database:', count);
            
            if (count === 0) {
                console.log('Database is empty. Initializing with student data...');
                await User.insertMany(students);
                console.log('Successfully inserted', students.length, 'students');
            } else if (count !== students.length) {
                console.log('Updating student data...');
                await User.deleteMany({});
                await User.insertMany(students);
                console.log('Successfully updated student data');
            } else {
                console.log('Database already contains correct number of users');
            }
        }

        // Verify data
        const verifyCount = await User.countDocuments();
        console.log('Verification: database contains', verifyCount, 'users');
        
        return connection;
    } catch (error) {
        console.error('MongoDB connection/initialization error:', error);
        throw error;
    }
}

// Models
const voteSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    categoryId: { type: String, required: true },
    nomineeId: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

let Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

// Helper function to verify JWT token
const verifyToken = (authHeader) => {
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        return jwt.verify(token, JWT_SECRET);
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
                const parsedCode = parseInt(code);
                console.log('Parsed code:', parsedCode);
                
                if (isNaN(parsedCode)) {
                    console.log('Invalid code format - not a number');
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({ message: 'Invalid code format' })
                    };
                }

                let user = null;

                // If database connection is not available, use in-memory approach
                if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
                    console.log('Using in-memory authentication instead of database');
                    // Find user in the static students array
                    user = students.find(s => s.id === parsedCode);
                } else {
                    // Get User model after connection
                    const User = mongoose.model('User');
                    
                    // Verify database connection
                    if (mongoose.connection.readyState !== 1) {
                        console.log('Database connection lost, attempting to reconnect...');
                        await connectToDatabase();
                    }

                    user = await User.findOne({ id: parsedCode });
                    console.log('Database query result:', user);
                    
                    if (!user) {
                        // Double-check if database needs initialization
                        const count = await User.countDocuments();
                        if (count === 0) {
                            console.log('Database appears empty, attempting reinitialization...');
                            await connectToDatabase();
                            // Try finding the user again
                            const retryUser = await User.findOne({ id: parsedCode });
                            if (!retryUser) {
                                console.log('User still not found after reinitialization');
                                
                                // Fallback to in-memory authentication as last resort
                                user = students.find(s => s.id === parsedCode);
                                if (!user) {
                                    return {
                                        statusCode: 401,
                                        headers,
                                        body: JSON.stringify({ message: 'Invalid code - user not found' })
                                    };
                                }
                            } else {
                                user = retryUser;
                            }
                        } else {
                            // Fallback to in-memory authentication as last resort
                            user = students.find(s => s.id === parsedCode);
                            if (!user) {
                                return {
                                    statusCode: 401,
                                    headers,
                                    body: JSON.stringify({ message: 'Invalid code - user not found' })
                                };
                            }
                        }
                    }
                }
                
                // At this point, we should have a user, either from DB or in-memory
                if (!user) {
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({ message: 'Invalid code - user not found' })
                    };
                }

                const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
                console.log('Generated token for user:', user.name);
                
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
                    body: JSON.stringify({ 
                        message: 'Server error during login', 
                        error: error.message,
                        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                    })
                };
            }
        }

        // Protected routes - verify token
        let userData;
        try {
            // Handle case-insensitive headers in Netlify
            const authHeader = event.headers.authorization || event.headers.Authorization;
            
            if (!authHeader) {
                throw new Error('No authorization header provided');
            }
            
            userData = verifyToken(authHeader);
            console.log('Successfully verified token for user:', userData.userId);
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
            try {
                const { categoryId, nomineeId } = body;
                
                // Validate input
                if (!categoryId || nomineeId === undefined || nomineeId === null) {
                    console.error('Invalid vote data:', { categoryId, nomineeId });
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ message: 'Invalid vote data. Both categoryId and nomineeId are required.' })
                    };
                }
                
                const userId = userData.userId;
                console.log(`Processing vote - User: ${userId}, Category: ${categoryId}, Nominee: ${nomineeId}`);

                if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
                    // Use in-memory vote storage
                    console.log('Using in-memory vote storage');
                    
                    // Find existing vote
                    const existingVoteIndex = inMemoryVotes.findIndex(
                        v => v.userId === userId && v.categoryId === categoryId.toString()
                    );
                    
                    if (existingVoteIndex >= 0) {
                        // Update existing vote
                        inMemoryVotes[existingVoteIndex] = {
                            ...inMemoryVotes[existingVoteIndex],
                            nomineeId,
                            timestamp: new Date().toISOString()
                        };
                        console.log('Updated existing vote in memory');
                    } else {
                        // Create new vote
                        inMemoryVotes.push({
                            userId,
                            categoryId: categoryId.toString(),
                            nomineeId,
                            timestamp: new Date().toISOString()
                        });
                        console.log('Created new vote in memory');
                    }
                } else {
                    // Use database
                    try {
                        const existingVote = await Vote.findOne({ userId, categoryId: categoryId.toString() });
                        if (existingVote) {
                            existingVote.nomineeId = nomineeId;
                            existingVote.timestamp = Date.now();
                            await existingVote.save();
                            console.log('Updated existing vote in database');
                        } else {
                            await Vote.create({ 
                                userId, 
                                categoryId: categoryId.toString(), 
                                nomineeId 
                            });
                            console.log('Created new vote in database');
                        }
                    } catch (dbError) {
                        console.error('Database error while recording vote:', dbError);
                        throw new Error(`Database error: ${dbError.message}`);
                    }
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        message: 'Vote recorded successfully',
                        vote: {
                            userId,
                            categoryId,
                            nomineeId
                        }
                    })
                };
            } catch (voteError) {
                console.error('Error processing vote:', voteError);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        message: 'Error recording vote', 
                        error: voteError.message 
                    })
                };
            }
        }

        // Get user votes
        if (path === '/votes' && event.httpMethod === 'GET') {
            try {
                const userId = userData.userId;
                
                console.log(`Retrieving votes for user: ${userId}`);
                
                let votes = [];
                
                if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
                    // Use in-memory vote storage
                    console.log('Using in-memory vote storage to retrieve votes');
                    votes = inMemoryVotes.filter(v => v.userId === userId);
                    console.log(`Found ${votes.length} votes in memory for user ${userId}`);
                } else {
                    // Use database
                    try {
                        votes = await Vote.find({ userId });
                        console.log(`Found ${votes.length} votes in database for user ${userId}`);
                        
                        // Ensure all categoryId fields are strings
                        votes = votes.map(vote => ({
                            ...vote.toObject(),
                            categoryId: vote.categoryId.toString()
                        }));
                    } catch (dbError) {
                        console.error('Database error while retrieving votes:', dbError);
                        throw new Error(`Database error: ${dbError.message}`);
                    }
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(votes)
                };
            } catch (votesError) {
                console.error('Error retrieving votes:', votesError);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        message: 'Error retrieving votes', 
                        error: votesError.message 
                    })
                };
            }
        }

        // Admin routes
        if (path === '/admin/votes' && event.httpMethod === 'GET') {
            try {
                if (userData.userId !== 999999) {
                    console.log('Admin access denied for user:', userData.userId);
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ message: 'Admin access required' })
                    };
                }
                
                console.log('Admin retrieving all votes');
                
                let votes = [];
                
                if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
                    // Use in-memory vote storage
                    console.log('Using in-memory vote storage for admin votes');
                    votes = [...inMemoryVotes]; // Create a copy to avoid mutations
                    console.log(`Found ${votes.length} votes in memory for admin`);
                } else {
                    // Use database
                    try {
                        votes = await Vote.find().sort({ timestamp: -1 });
                        console.log(`Found ${votes.length} votes in database for admin`);
                        
                        // Convert mongoose documents to plain objects with string categoryIds
                        votes = votes.map(vote => ({
                            ...vote.toObject(),
                            categoryId: vote.categoryId.toString()
                        }));
                    } catch (dbError) {
                        console.error('Database error while retrieving admin votes:', dbError);
                        throw new Error(`Database error: ${dbError.message}`);
                    }
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(votes)
                };
            } catch (adminError) {
                console.error('Error retrieving admin votes:', adminError);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        message: 'Error retrieving admin votes', 
                        error: adminError.message 
                    })
                };
            }
        }

        // Admin - Reset votes
        if (path === '/admin/reset-votes' && event.httpMethod === 'POST') {
            try {
                if (userData.userId !== 999999) {
                    console.log('Admin access denied for user:', userData.userId);
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ message: 'Admin access required' })
                    };
                }
                
                console.log('Admin resetting all votes');
                
                if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
                    // Use in-memory vote storage
                    console.log('Resetting in-memory votes');
                    const previousCount = inMemoryVotes.length;
                    inMemoryVotes = [];
                    console.log(`Reset complete. Removed ${previousCount} votes from memory.`);
                } else {
                    // Use database
                    try {
                        const result = await Vote.deleteMany({});
                        console.log(`Reset complete. Removed ${result.deletedCount} votes from database.`);
                    } catch (dbError) {
                        console.error('Database error while resetting votes:', dbError);
                        throw new Error(`Database error during reset: ${dbError.message}`);
                    }
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        message: 'All votes reset successfully',
                        success: true
                    })
                };
            } catch (resetError) {
                console.error('Error resetting votes:', resetError);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        message: 'Error resetting votes', 
                        error: resetError.message 
                    })
                };
            }
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