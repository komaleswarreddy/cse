/**
 * Local API Mocking for Development
 * This script provides mock API functionality when running the app locally
 */

// Check if we're running locally
const isLocalEnvironment = window.location.hostname === '127.0.0.1' || 
                         window.location.hostname === 'localhost';

// Only run this script if we're in a local environment
if (isLocalEnvironment) {
    console.log('🔧 Running in local development mode - API calls will be mocked');
    
    // Store votes in localStorage for persistence during local development
    const LOCAL_VOTES_KEY = 'cse6_local_votes';
    
    // Initialize local storage if needed
    if (!localStorage.getItem(LOCAL_VOTES_KEY)) {
        localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify({}));
    }
    
    // Override fetch to intercept API calls
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        // Only intercept our API calls
        if (typeof url === 'string' && (
            url.includes('/api/login') || 
            url.includes('/api/vote') || 
            url.includes('/api/votes') || 
            url.includes('/api/admin/votes') ||
            url.includes('/api/admin/reset-votes'))) {
            
            console.log('🔄 Intercepting API call:', url, options);
            
            // Add delay to simulate network
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return handleLocalApiCall(url, options);
        }
        
        // Otherwise, use the original fetch
        return originalFetch.apply(this, arguments);
    };
    
    // Handle local API calls
    async function handleLocalApiCall(url, options) {
        // Parse the endpoint from the URL
        const endpoint = url.split('/').pop();
        
        // Special admin bypass - if we see this token, always treat it as admin
        const ADMIN_BYPASS_TOKEN = 'admin-bypass-999999';
        
        try {
            let responseData;
            let status = 200;
            
            // For debugging, check for admin access
            const authHeader = options.headers && options.headers.Authorization;
            let isAdmin = false;
            
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                console.log('Token in request:', token);
                
                if (token) {
                    // Special admin bypass check
                    if (token === ADMIN_BYPASS_TOKEN) {
                        console.log('Using admin bypass token - always granting access');
                        isAdmin = true;
                        
                        // If this is an admin endpoint, handle it directly
                        if (url.includes('/api/admin/')) {
                            console.log('Direct admin endpoint handling for bypass token');
                            
                            if (url.includes('/api/admin/votes')) {
                                // Return empty votes array
                                return new Response(JSON.stringify([]), { status: 200 });
                            } else if (url.includes('/api/admin/reset-votes')) {
                                // Reset votes directly
                                localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify({}));
                                return new Response(JSON.stringify({ message: 'Votes reset' }), { status: 200 });
                            }
                        }
                    } else {
                        // Normal token check
                        const tokenParts = token.split('-');
                        const userId = parseInt(tokenParts[tokenParts.length - 1]);
                        console.log('User ID from token:', userId);
                        
                        if (userId === 999999) {
                            console.log('Valid admin token detected');
                            isAdmin = true;
                        }
                    }
                }
            }
            
            // Login endpoint
            if (url.includes('/api/login')) {
                responseData = await handleLogin(options);
            }
            // Vote endpoint
            else if (url.includes('/api/vote') && options.method === 'POST') {
                responseData = await handleVote(options);
            }
            // Get user votes
            else if (url.includes('/api/votes') && !url.includes('/admin')) {
                responseData = await handleGetUserVotes(options);
            }
            // Admin votes
            else if (url.includes('/api/admin/votes') && !url.includes('reset-votes')) {
                responseData = await handleAdminVotes(options);
            }
            // Reset all votes
            else if (url.includes('/api/admin/reset-votes') && options.method === 'POST') {
                responseData = await handleResetVotes(options);
            }
            // Unknown endpoint
            else {
                responseData = { message: 'Endpoint not supported in local mode' };
                status = 404;
            }
            
            // Create a mock response
            const blob = new Blob([JSON.stringify(responseData)], {type: 'application/json'});
            return new Response(blob, { status: status });
            
        } catch (error) {
            console.error('Local API error:', error);
            
            // Create an error response
            const blob = new Blob([JSON.stringify({ message: error.message })], {type: 'application/json'});
            return new Response(blob, { status: 401 });
        }
    }
    
    // Handle login requests
    async function handleLogin(options) {
        const body = JSON.parse(options.body);
        const code = parseInt(body.code);
        
        // Check if this is the admin code
        if (code === 999999) {
            // Create admin user
            const adminUser = {
                id: 999999,
                name: "Admin",
                phone: ""
            };
            
            // Create a fake token
            const timestamp = Date.now();
            const token = `local-token-${timestamp}-999999`;
            return { user: adminUser, token };
        }
        
        // Regular student login
        const user = students.find(s => s.id === code);
        
        if (!user) {
            throw new Error('Invalid code');
        }
        
        // Create a fake token
        const timestamp = Date.now();
        const token = `local-token-${timestamp}-${code}`;
        return { user, token };
    }
    
    // Handle vote submission
    async function handleVote(options) {
        // Extract auth token from header
        const authHeader = options.headers.Authorization || '';
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new Error('No token provided');
        }
        
        // Extract user ID from token (in real app, this would be from JWT)
        // The token format is 'local-token-timestamp-userId'
        const tokenParts = token.split('-');
        const userId = parseInt(tokenParts[tokenParts.length - 1]);
        
        // Parse vote data
        const body = JSON.parse(options.body);
        const { categoryId, nomineeId } = body;
        
        // Save to local storage
        const votes = JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || '{}');
        
        if (!votes[userId]) {
            votes[userId] = {};
        }
        
        // Store the vote with categoryId as string to avoid issues
        const categoryIdStr = categoryId.toString();
        votes[userId][categoryIdStr] = {
            userId,
            categoryId: categoryIdStr,
            nomineeId,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes));
        console.log(`Vote saved for user ${userId}, category ${categoryId}, nominee ${nomineeId}`);
        console.log('Current votes in storage:', votes);
        
        return { message: 'Vote recorded successfully' };
    }
    
    // Handle get user votes
    async function handleGetUserVotes(options) {
        // Extract auth token
        const authHeader = options.headers.Authorization || '';
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new Error('No token provided');
        }
        
        // Extract user ID from token
        const tokenParts = token.split('-');
        const userId = parseInt(tokenParts[tokenParts.length - 1]);
        
        console.log(`Getting votes for user ${userId}`);
        
        // Get votes from storage
        const allVotes = JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || '{}');
        const userVotes = allVotes[userId] || {};
        
        console.log('User votes from storage:', userVotes);
        
        // Convert to array for API compatibility
        const votesArray = Object.values(userVotes);
        console.log('Returning votes array:', votesArray);
        
        return votesArray;
    }
    
    // Handle admin votes request
    async function handleAdminVotes(options) {
        try {
            // Extract auth token
            const authHeader = options.headers.Authorization || '';
            const token = authHeader.split(' ')[1];
            
            if (!token) {
                console.error('No token provided in admin votes request');
                throw new Error('No token provided');
            }
            
            console.log('Admin token:', token);
            
            // Always allow 999999 admin code
            const ADMIN_CODE = 999999;
            
            // Extract user ID from token
            let userId = null;
            
            if (token.includes('-')) {
                const tokenParts = token.split('-');
                userId = parseInt(tokenParts[tokenParts.length - 1]);
                console.log('Parsed user ID from token:', userId);
            } else {
                console.warn('Token does not contain expected format, attempting other checks');
                
                // Try to check if token contains admin ID
                if (token.includes(ADMIN_CODE.toString())) {
                    userId = ADMIN_CODE;
                    console.log('Found admin code in token');
                }
            }
            
            // Check if admin code is defined and correctly used
            console.log('Admin code check:', userId, 'should be', ADMIN_CODE);
            
            // Check if admin
            if (userId !== ADMIN_CODE) {
                console.error('Admin access denied for user ID:', userId);
                throw new Error('Admin access required');
            }
            
            console.log('Admin access granted, fetching all votes');
            
            // Get all votes
            const allVotes = JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || '{}');
            
            // Convert nested structure to flat array for API compatibility
            const votesArray = [];
            
            Object.keys(allVotes).forEach(userId => {
                Object.values(allVotes[userId]).forEach(vote => {
                    votesArray.push(vote);
                });
            });
            
            console.log('Returning all votes for admin:', votesArray);
            
            return votesArray;
        } catch (error) {
            console.error('Error in handleAdminVotes:', error);
            throw error;
        }
    }
    
    // Handle reset votes request
    async function handleResetVotes(options) {
        try {
            // Extract auth token
            const authHeader = options.headers.Authorization || '';
            const token = authHeader.split(' ')[1];
            
            if (!token) {
                console.error('No token provided in reset votes request');
                throw new Error('No token provided');
            }
            
            console.log('Reset votes token:', token);
            
            // Always allow 999999 admin code
            const ADMIN_CODE = 999999;
            
            // Extract user ID from token
            let userId = null;
            
            if (token.includes('-')) {
                const tokenParts = token.split('-');
                userId = parseInt(tokenParts[tokenParts.length - 1]);
                console.log('Parsed user ID from token:', userId);
            } else {
                console.warn('Token does not contain expected format, attempting other checks');
                
                // Try to check if token contains admin ID
                if (token.includes(ADMIN_CODE.toString())) {
                    userId = ADMIN_CODE;
                    console.log('Found admin code in token');
                }
            }
            
            // Check if admin
            if (userId !== ADMIN_CODE) {
                console.error('Admin access denied for user ID:', userId);
                throw new Error('Admin access required');
            }
            
            console.log('Admin resetting all votes');
            
            // Reset all votes
            localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify({}));
            
            return { message: 'All votes reset successfully' };
        } catch (error) {
            console.error('Error in handleResetVotes:', error);
            throw error;
        }
    }
    
    console.log('✅ Local API mocking is ready');
} 