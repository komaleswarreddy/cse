const jwt = require('jsonwebtoken');

// Get JWT secret from environment or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'cse6-poll-system-default-secret-key';

// In-memory storage for votes when MongoDB is not available
let inMemoryVotes = [];

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

// Helper function to verify JWT token
const verifyToken = (authHeader) => {
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        console.log('Verifying token:', token);
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);
        return decoded;
    } catch (err) {
        console.error('Token verification error:', err);
        throw new Error('Invalid token');
    }
};

// Helper function to check if a user is an admin
const isAdmin = (userId) => {
    console.log('Admin check - User ID:', userId, 'Type:', typeof userId);
    // Convert to number if it's a string and then compare
    if (typeof userId === 'string') {
        userId = parseInt(userId);
    }
    return userId === 999999;
};

exports.handler = async (event, context) => {
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
        const path = event.path.replace('/.netlify/functions/api', '');
        const body = JSON.parse(event.body || '{}');

        console.log(`Processing ${event.httpMethod} request to ${path}`);

        // Login route
        if (path === '/login' && event.httpMethod === 'POST') {
            try {
                const { code } = body;
                console.log('Login attempt for code:', code);
                
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

                // Find user in the static students array
                const user = students.find(s => s.id === parsedCode);
                
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
                        error: error.message
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
                console.log('Vote payload:', { categoryId, nomineeId, body });
                
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
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        message: 'Vote recorded successfully',
                        vote: {
                            userId,
                            categoryId: categoryId.toString(),
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
                
                // Get votes for this user from in-memory storage
                const votes = inMemoryVotes.filter(v => v.userId === userId);
                console.log(`Found ${votes.length} votes for user ${userId}`);
                
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
                console.log('Admin check - User ID from token:', userData.userId);
                
                // Use loose comparison to handle string/number conversion
                if (userData.userId != 999999) {
                    console.log('Admin access denied for user:', userData.userId);
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ message: 'Admin access required' })
                    };
                }
                
                console.log('Admin access granted for user:', userData.userId);
                console.log('Admin retrieving all votes');
                
                // Return all votes from in-memory storage
                const votes = [...inMemoryVotes];
                console.log(`Found ${votes.length} votes for admin`);
                
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
                console.log('Admin reset check - User ID from token:', userData.userId);
                
                // Use loose comparison to handle string/number conversion
                if (userData.userId != 999999) {
                    console.log('Admin access denied for user:', userData.userId);
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ message: 'Admin access required' })
                    };
                }
                
                console.log('Admin access granted for reset. User ID:', userData.userId);
                console.log('Admin resetting all votes');
                
                // Reset in-memory votes
                const previousCount = inMemoryVotes.length;
                inMemoryVotes = [];
                console.log(`Reset complete. Removed ${previousCount} votes from memory.`);
                
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
