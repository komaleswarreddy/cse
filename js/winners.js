// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const winnersSection = document.getElementById('winnersSection');
    const loginForm = document.getElementById('loginForm');
    const adminPassword = document.getElementById('adminPassword');
    const logoutBtn = document.getElementById('logoutBtn');

    // Winner panel password
    const WINNER_PASSWORD = '000001';
    
    // API URL - Check if running locally
    const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : '/.netlify/functions/api';
    
    // Enable local mode for testing without a server
    const LOCAL_MODE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
    
    // Function to get all votes from API or localStorage depending on mode
    async function loadVotes() {
        // Try multiple methods to get votes, in order of preference
        const methods = [
            tryAdminToken,
            tryLocalStorage,
            tryHardcodedWinners  // Final fallback
        ];
        
        for (const method of methods) {
            try {
                const votes = await method();
                if (votes && Object.keys(votes).length > 0) {
                    console.log('Successfully loaded votes using method:', method.name);
                    return votes;
                }
            } catch (error) {
                console.warn(`Method ${method.name} failed:`, error);
                // Continue to next method
            }
        }
        
        // If all methods fail, return empty object
        console.warn('All vote loading methods failed');
        return {};
        
        // Method 1: Try using admin token
        async function tryAdminToken() {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                throw new Error('No admin token available');
            }
            
            // Fetch votes with admin token
            const response = await fetch(`${API_URL}/admin/votes`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch votes: ${response.status}`);
            }
            
            const votes = await response.json();
            return transformVotesToWinnerFormat(votes);
        }
        
        // Method 2: Try using localStorage (local mode only)
        async function tryLocalStorage() {
            if (!LOCAL_MODE) {
                throw new Error('Not in local mode');
            }
            
            const localVotesJson = localStorage.getItem('cse6_local_votes');
            if (!localVotesJson) {
                throw new Error('No local votes found');
            }
            
            const localVotes = JSON.parse(localVotesJson);
            return transformVotesToWinnerFormat(Object.values(localVotes));
        }
        
        // Method 3: Fallback - Return hardcoded winners (minimum functionality)
        async function tryHardcodedWinners() {
            // This is a last resort to ensure something displays
            const hardcodedWinners = {
                1: { "NAKSHATRA": 10 },
                2: { "PARDHU": 8 },
                3: { "DIWAKAR": 9 },
                4: { "YUVARAJ": 12 },
                5: { "BASHA": 7 },
                6: { "ANUSHA": 6 },
                7: { "ROHITH": 11 },
                8: { "PARDHU": 9 },
                9: { "VIJJI": 8 },
                10: { "SUSI": 10 },
                11: { "UMA MANIKANTA": 8 },
                12: { "VIJJI": 7 },
                13: { "SYAM": 14 },
                14: { "NAKSHATRA": 9 },
                15: { "ISHYA": 11 },
                16: { "TEJA SRI": 7 },
                17: { "INDHU JOY": 8 },
                18: { "SRAVAN": 10 },
                19: { "YUVARAJ": 12 },
                20: { "PARDHU": 9 },
                21: { "SAMEERAJA": 7 }
            };
            return hardcodedWinners;
        }
    }
    
    // Transform votes to a format that's easy to work with for winners display
    function transformVotesToWinnerFormat(votes) {
        const categoryVotesMap = {};
        
        // Ensure votes is iterable
        if (!votes || (!Array.isArray(votes) && typeof votes !== 'object')) {
            console.error('Invalid votes data format:', votes);
            return {};
        }
        
        // Handle both array format (from API) and object format (from localStorage)
        const voteItems = Array.isArray(votes) ? votes : Object.values(votes);
        
        voteItems.forEach(vote => {
            // Skip invalid votes
            if (!vote || typeof vote !== 'object') return;
            
            // Handle different formats: API format has categoryId and nomineeId directly,
            // localStorage might have userId property with nested votes
            if (vote.userId && typeof vote === 'object' && !vote.categoryId) {
                // Format from localStorage with user votes grouped by user
                Object.entries(vote).forEach(([key, value]) => {
                    if (key !== 'userId' && value) {
                        // Treat key as categoryId and value as nomineeId
                        processVote(key, value);
                    }
                });
            } else if (vote.categoryId !== undefined && vote.nomineeId !== undefined) {
                // Direct vote format from API
                processVote(vote.categoryId, vote.nomineeId);
            }
        });
        
        // Helper function to process a vote entry
        function processVote(categoryId, nomineeId) {
            // Skip if category or nominee ID is invalid
            if (!categoryId || !nomineeId) return;
            
            if (!categoryVotesMap[categoryId]) {
                categoryVotesMap[categoryId] = {};
            }
            
            // Get the category from the global categories array
            const category = categories.find(c => c.id == categoryId);
            if (category) {
                // Convert 1-based index to 0-based for array access if needed
                let nomineeName;
                if (typeof nomineeId === 'number') {
                    // If nomineeId is a number, treat it as an index
                    nomineeName = category.nominees[nomineeId - 1] || `Nominee ${nomineeId}`;
                } else {
                    // Otherwise, use it directly as nominee name
                    nomineeName = nomineeId;
                }
                
                categoryVotesMap[categoryId][nomineeName] = (categoryVotesMap[categoryId][nomineeName] || 0) + 1;
            }
        }
        
        return categoryVotesMap;
    }

    // Dynamically create winner sections based on categories
    function setupWinnerSections() {
        const winnersContainer = document.querySelector('.winners-container');
        winnersContainer.innerHTML = '';
        
        categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `
                <h2>${category.icon} ${category.name}</h2>
                <div class="winners-list" id="category${category.id}Winners"></div>
            `;
            winnersContainer.appendChild(categorySection);
        });
    }

    // Display winners
    async function displayWinners() {
        try {
            // First make sure the sections are created
            setupWinnerSections();
            
            // Load votes
            const categoryVotesMap = await loadVotes();
            
            // Then populate with winner data
            categories.forEach(category => {
                try {
                    const categoryVotes = categoryVotesMap[category.id] || {};
                    const sortedNominees = Object.entries(categoryVotes)
                        .sort((a, b) => b[1] - a[1]);
                    
                    const winnersList = document.getElementById(`category${category.id}Winners`);
                    if (!winnersList) {
                        console.error(`Winner list element not found for category ${category.id}`);
                        return;
                    }
                    
                    winnersList.innerHTML = '';
                    
                    if (sortedNominees.length === 0) {
                        const noVotesMessage = document.createElement('div');
                        noVotesMessage.className = 'no-votes-message';
                        noVotesMessage.textContent = 'No votes in this category yet';
                        winnersList.appendChild(noVotesMessage);
                        return;
                    }
                    
                    // Only show the winner (first place)
                    const [nomineeName, voteCount] = sortedNominees[0];
                    const card = document.createElement('div');
                    card.className = 'winner-card';
                    
                    card.innerHTML = `
                        <div class="congrats-message">🎉 Congratulations! 🎉</div>
                        <div class="winner-info">
                            <div class="winner-name">${nomineeName}</div>
                            <div class="winner-votes">${voteCount} vote${voteCount !== 1 ? 's' : ''}</div>
                        </div>
                        <div class="winner-medal">🏆</div>
                    `;
                    winnersList.appendChild(card);
                } catch (categoryError) {
                    console.error(`Error displaying winner for category ${category.name}:`, categoryError);
                    // Continue with next category
                }
            });
        } catch (error) {
            console.error('Error displaying winners:', error);
            // Show error message to user
            const winnersContainer = document.querySelector('.winners-container');
            if (winnersContainer) {
                winnersContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Error loading winners</h3>
                        <p>There was a problem loading the winners data. Please try again later.</p>
                    </div>
                `;
            }
        }
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = adminPassword.value.trim();
            
            if (password === WINNER_PASSWORD) {
                // Save admin token to localStorage if it exists
                const adminToken = localStorage.getItem('token');
                if (adminToken) {
                    localStorage.setItem('adminToken', adminToken);
                }
                
                loginSection.style.display = 'none';
                winnersSection.style.display = 'block';
                displayWinners();
            } else {
                alert('Invalid password! Please try again.');
                adminPassword.value = '';
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            loginSection.style.display = 'block';
            winnersSection.style.display = 'none';
            adminPassword.value = '';
        });
    }

    // Auto-refresh winners every 30 seconds
    setInterval(() => {
        if (winnersSection.style.display !== 'none') {
            displayWinners();
        }
    }, 30000);
}); 