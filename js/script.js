// DOM Elements
const loginBtn = document.getElementById('login-btn');
const codeInput = document.getElementById('code-input');
const errorMessage = document.getElementById('error-message');
const studentDashboard = document.getElementById('student-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const studentName = document.getElementById('student-name');
const categoriesContainer = document.getElementById('categories-container');
const resultsWrapper = document.getElementById('results-wrapper');
const searchInput = document.getElementById('search-input');
const studentLogoutBtn = document.getElementById('student-logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const totalVotesEl = document.getElementById('total-votes');
const studentsVotedEl = document.getElementById('students-voted');
const popularCategoryEl = document.getElementById('popular-category');
const prevCategoryBtn = document.getElementById('prev-category-btn');
const nextCategoryBtn = document.getElementById('next-category-btn');
const currentCategoryEl = document.getElementById('current-category');
const totalCategoriesEl = document.getElementById('total-categories');
const categoryProgressBar = document.getElementById('category-progress');

// ADMIN_CODE is already defined in data.js

// API URL - Check if running locally
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/.netlify/functions/api';

// Enable local mode for testing without a server
const LOCAL_MODE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');

// State variables
let currentUser = null;
let votes = {};
let currentCategoryIndex = 0;

// Initialize the app
initializeApp();

// Check for WhatsApp integration
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        if (document.getElementById('admin-dashboard').style.display === 'block' && 
            typeof addSendIdButton === 'function') {
            console.log('Admin dashboard already visible, adding WhatsApp button');
            addSendIdButton();
        }
    }, 1000);
});

// Event Listeners
loginBtn.addEventListener('click', handleLogin);
studentLogoutBtn.addEventListener('click', handleLogout);
adminLogoutBtn.addEventListener('click', handleLogout);
searchInput.addEventListener('input', handleSearch);
prevCategoryBtn.addEventListener('click', showPreviousCategory);
nextCategoryBtn.addEventListener('click', showNextCategory);

// Event listener for View Winners button
document.getElementById('view-winners-btn')?.addEventListener('click', function() {
    // Make sure there's an adminToken available for the winners page
    const token = localStorage.getItem('token');
    if (token && currentUser?.id === ADMIN_CODE) {
        localStorage.setItem('adminToken', token);
    }
    window.open('winners.html', '_blank');
});

// Input validation for 6-digit code
codeInput.addEventListener('input', function(e) {
    // Only allow numbers
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    if (this.value.length > 6) {
        this.value = this.value.slice(0, 6);
    }
});

// Enter key for login
codeInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

// Functions
async function initializeApp() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        try {
            // First, get the user's votes
            const votesResponse = await fetch(`${API_URL}/votes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!votesResponse.ok) {
                throw new Error('Failed to fetch votes');
            }

            const userVotes = await votesResponse.json();
            // Transform votes array into an object for easier access
            votes = userVotes.reduce((acc, vote) => {
                acc[vote.categoryId] = vote.nomineeId;
                return acc;
            }, {});
            
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser.id === ADMIN_CODE) {
                await showAdminDashboard();
        } else {
            showStudentDashboard();
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            handleLogout();
        }
    }
}

async function handleLogin() {
    const code = codeInput.value.trim();
    
    if (!code) {
        showError('Please enter your 6-digit code');
        return;
    }
    
    if (!/^\d{6}$/.test(code)) {
        showError('Please enter a valid 6-digit code');
        return;
    }
    
    // Check if this is admin login
    const isAdmin = parseInt(code) === ADMIN_CODE;
    console.log('Login attempt - Admin check:', isAdmin, 'Code:', code, 'ADMIN_CODE:', ADMIN_CODE);
    
    try {
        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        console.log('Attempting login with code:', code);
        
        let data;
        
        if (LOCAL_MODE) {
            // Local mode - fetch will be intercepted by localApi.js
            console.log('Using local mode for login');
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code })
                });
                
                // Check if response is ok
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Login failed');
                }
                
                data = await response.json();
                console.log('Login response:', data);
                
                // If admin login, also store adminToken
                if (isAdmin) {
                    localStorage.setItem('adminToken', data.token);
                }
            } catch (error) {
                console.error('Local login error:', error);
                throw error;
            }
        } else {
            // Production mode - use real API
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            data = await response.json();
            console.log('Login response:', data);
            
            // If admin login, also store adminToken
            if (isAdmin) {
                localStorage.setItem('adminToken', data.token);
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
        }

        console.log('Login successful:', data.user);
        currentUser = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Get user's votes
        if (LOCAL_MODE) {
            try {
                // In local mode, fetch will be intercepted by localApi.js
                const votesResponse = await fetch(`${API_URL}/votes`, {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });
                
                if (!votesResponse.ok) {
                    throw new Error('Failed to fetch votes');
                }
                
                const userVotes = await votesResponse.json();
                console.log('User votes from API:', userVotes);
                
                // Transform votes array into an object for easier access
                votes = {};
                userVotes.forEach(vote => {
                    // Make sure to convert categoryId to string for consistency
                    votes[vote.categoryId.toString()] = vote.nomineeId;
                });
                console.log('Transformed votes object:', votes);
            } catch (error) {
                console.warn('Error fetching votes in local mode:', error);
                votes = {};
            }
        } else {
            // In production, fetch from API
            console.log('Fetching user votes...');
            const votesResponse = await fetch(`${API_URL}/votes`, {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });

            if (!votesResponse.ok) {
                console.error('Failed to fetch votes:', await votesResponse.text());
                throw new Error('Failed to fetch votes');
            }

            const userVotes = await votesResponse.json();
            console.log('User votes from API:', userVotes);
            
            // Transform votes array into an object for easier access
            votes = {};
            userVotes.forEach(vote => {
                votes[vote.categoryId.toString()] = vote.nomineeId;
            });
            console.log('Transformed votes object:', votes);
        }

        if (currentUser.id === ADMIN_CODE) {
            await showAdminDashboard();
        } else {
            showStudentDashboard();
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        // Reset login button
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.opacity = 1;
    
    // Shake animation
    codeInput.classList.add('shake');
    setTimeout(() => {
        codeInput.classList.remove('shake');
    }, 500);
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorMessage.style.opacity = 0;
    }, 5000);
}

function showStudentDashboard() {
    // Hide login container and show student dashboard
    document.querySelector('.container').style.display = 'none';
    studentDashboard.style.display = 'block';
    
    // Set student name
    studentName.textContent = currentUser.name;
    
    // Reset category index
    currentCategoryIndex = 0;
    
    // Update total categories count
    totalCategoriesEl.textContent = categories.length;
    
    // Render categories for voting
    renderCategories();
    
    // Update navigation controls
    updateNavigation();
}

async function showAdminDashboard() {
    document.querySelector('.container').style.display = 'none';
    adminDashboard.style.display = 'block';
    
    // Use the inline button as the primary method (more reliable)
    const inlineButton = document.getElementById('inline-whatsapp-btn');
    if (inlineButton) {
        console.log('Using inline WhatsApp button (most reliable)');
    } else {
        console.log('Inline button not found - making sure it exists');
        try {
            // Create the inline button if it doesn't exist
            const adminControls = document.querySelector('.admin-controls');
            if (adminControls) {
                const newButton = document.createElement('button');
                newButton.id = 'inline-whatsapp-btn';
                newButton.className = 'btn whatsapp-btn';
                newButton.innerHTML = '<i class="fab fa-whatsapp"></i><span>Send IDs via WhatsApp</span>';
                
                // Add the button before the logout button
                const logoutBtn = document.getElementById('admin-logout-btn');
                if (logoutBtn) {
                    adminControls.insertBefore(newButton, logoutBtn);
                } else {
                    adminControls.appendChild(newButton);
                }
                
                // Set up event listener if possible
                if (typeof sendAllStudentIds === 'function') {
                    newButton.addEventListener('click', sendAllStudentIds);
                } else {
                    // Try to load the WhatsApp script first
                    await new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'js/sendWhatsApp.js';
                        script.onload = resolve;
                        script.onerror = resolve; // Continue even if there's an error
                        document.head.appendChild(script);
                        
                        // Set a timeout to resolve anyway
                        setTimeout(resolve, 1000);
                    });
                    
                    // Now try to set up the event listener again
                    if (typeof sendAllStudentIds === 'function') {
                        newButton.addEventListener('click', sendAllStudentIds);
                    } else {
                        // Fallback to a minimal implementation
                        newButton.addEventListener('click', function() {
                            alert('To send WhatsApp messages, please use the console and type window.forceAddWhatsAppButton()');
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Error setting up inline WhatsApp button:', e);
        }
    }
    
    try {
        // Always use the fetch API approach for consistency, 
        // the localApi.js will intercept in local mode
        console.log('Fetching admin data');
        const token = localStorage.getItem('token');
        console.log('Using admin token:', token);
        
        // Debug current user
        console.log('Current user:', currentUser);
        console.log('Admin code:', ADMIN_CODE);
        
        const response = await fetch(`${API_URL}/admin/votes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Admin response error:', errorText);
            throw new Error('Failed to fetch admin data');
        }

        const allVotes = await response.json();
        console.log('Admin votes from API:', allVotes);
        
        // Update the votes object with all votes
        // Reset votes object first to avoid stale data
        votes = {};
        
        // Group votes by category for easier analysis
        allVotes.forEach(vote => {
            // Skip invalid votes that don't have required properties
            if (!vote || vote.categoryId === null || vote.categoryId === undefined || 
                vote.userId === null || vote.userId === undefined || 
                vote.nomineeId === null || vote.nomineeId === undefined) {
                console.warn('Skipping invalid vote:', vote);
                return; // Skip this iteration
            }
            
            const categoryId = vote.categoryId.toString();
            const userId = vote.userId.toString(); // Convert userId to string for consistency
            const nomineeId = vote.nomineeId;
            
            if (!votes[categoryId]) {
                votes[categoryId] = {};
            }
            
            votes[categoryId][userId] = nomineeId;
        });
        
        console.log('Processed votes by category:', votes);

        // Render results and update statistics
        renderResults();
        updateStatistics();
        
        // Add "Reset All Votes" button after a delay to ensure DOM is ready
        setTimeout(() => {
            addResetButton();
            
            // Check if the inline button is working
            const inlineButton = document.getElementById('inline-whatsapp-btn');
            if (inlineButton) {
                console.log('Inline WhatsApp button is present and should be working');
                
                // Make sure it has an event listener
                if (!inlineButton.onclick && !inlineButton._hasListener) {
                    console.log('Adding click event to inline button');
                    inlineButton._hasListener = true;
                    
                    // Set up the inline button event handler
                    inlineButton.addEventListener('click', function() {
                        console.log('Inline WhatsApp button clicked (from delayed handler)');
                        if (typeof sendAllStudentIds === 'function') {
                            sendAllStudentIds();
                        } else {
                            // Create a basic modal if the function isn't available
                            alert('WhatsApp feature is not fully loaded. Please refresh the page and try again.');
                        }
                    });
                }
            } else {
                console.log('WhatsApp inline button missing in delayed check');
            }
        }, 500);
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showError('Failed to load admin data');
        handleLogout();
    }
}

function handleLogout() {
    currentUser = null;
    votes = {};
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    document.querySelector('.container').style.display = 'flex';
    studentDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    codeInput.value = '';
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const resultCards = document.querySelectorAll('.result-card');
    
    resultCards.forEach(card => {
        const categoryName = card.querySelector('.result-category').textContent.toLowerCase();
        const nominees = Array.from(card.querySelectorAll('.result-nominee-name')).map(el => el.textContent.toLowerCase());
        
        // Check if category or any nominee matches search term
        const matchesCategory = categoryName.includes(searchTerm);
        const matchesNominee = nominees.some(nominee => nominee.includes(searchTerm));
        
        if (matchesCategory || matchesNominee) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderCategories() {
    categoriesContainer.innerHTML = '';
    
    categories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('category-card');
        categoryCard.id = `category-${category.id}`;
        
        // Hide all categories except the current one
        if (index !== currentCategoryIndex) {
            categoryCard.style.display = 'none';
        }
        
        // Get the current vote for this category by this user
        const userVote = getUserVoteForCategory(category.id);
        
        // Create header
        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        
        // Check if user has voted in this category
        if (userVote) {
            categoryCard.classList.add('voted');
            categoryHeader.innerHTML = `
                <h3>${category.icon} ${category.name}</h3>
                <span class="vote-status voted"><i class="fas fa-check-circle"></i> Voted</span>
            `;
        } else {
            categoryHeader.innerHTML = `
                <h3>${category.icon} ${category.name}</h3>
                <span class="vote-status not-voted"><i class="fas fa-circle"></i> Not voted</span>
            `;
        }
        
        // Create nominees list
        const nomineesDiv = document.createElement('div');
        nomineesDiv.classList.add('category-nominees');
        
        category.nominees.forEach(nominee => {
            const checked = userVote === nominee ? 'checked' : '';
            const id = `nominee-${category.id}-${nominee.replace(/\s+/g, '-')}`;
            
            const nomineeItem = document.createElement('div');
            nomineeItem.classList.add('nominee-item');
            nomineeItem.innerHTML = `
                <input type="radio" name="category-${category.id}" id="${id}" value="${nominee}" ${checked}>
                <label for="${id}">
                    <div class="radio-custom"></div>
                    ${nominee}
                </label>
            `;
            
            // Add event listener for voting
            const input = nomineeItem.querySelector('input');
            input.addEventListener('change', function() {
                if (this.checked) {
                    handleVote(category.id, nominee);
                    // Update categories after voting
                    renderCategories();
                }
            });
            
            nomineesDiv.appendChild(nomineeItem);
        });
        
        // Add elements to category card
        categoryCard.appendChild(categoryHeader);
        categoryCard.appendChild(nomineesDiv);
        
        // Add card to container
        categoriesContainer.appendChild(categoryCard);
    });
    
    // Update navigation controls whenever categories are rendered
    updateNavigation();
}

function renderResults() {
    resultsWrapper.innerHTML = '';
    
    categories.forEach(category => {
        const resultCard = document.createElement('div');
        resultCard.classList.add('result-card');
        resultCard.id = `result-card-${category.id}`;
        
        // Create category title
        const categoryTitle = document.createElement('div');
        categoryTitle.classList.add('result-category');
        categoryTitle.textContent = `${category.icon} ${category.name}`;
        
        // Create nominees results
        const nomineesResults = document.createElement('div');
        nomineesResults.classList.add('result-nominees');
        
        // Get votes for this category
        const categoryVotes = getCategoryVotes(category.id);
        const totalVotes = Object.values(categoryVotes).reduce((sum, count) => sum + count, 0);
        const sortedNominees = [...category.nominees].sort((a, b) => 
            (categoryVotes[b] || 0) - (categoryVotes[a] || 0)
        );
        
        // Create mini chart for this category
        const chartDiv = document.createElement('div');
        chartDiv.classList.add('chart-container');
        chartDiv.style.height = '120px';
        chartDiv.innerHTML = `<canvas id="result-chart-${category.id}"></canvas>`;
        
        // Add chart container after title
        resultCard.appendChild(categoryTitle);
        
        // Only add chart if there are votes
        if (totalVotes > 0) {
            resultCard.appendChild(chartDiv);
            
            // Initialize chart with a delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    const chartCanvas = document.getElementById(`result-chart-${category.id}`);
                    if (chartCanvas) {
                        // Prepare data for chart
                        const labels = [];
                        const data = [];
                        const backgroundColors = [];
                        
                        // Get top 5 nominees with votes for better visualization
                        const topNominees = sortedNominees
                            .filter(nominee => categoryVotes[nominee] > 0)
                            .slice(0, 5);
                            
                        topNominees.forEach((nominee, index) => {
                            labels.push(nominee);
                            data.push(categoryVotes[nominee] || 0);
                            
                            // Generate colors based on index
                            const hue = 200 + (index * 30) % 160; // Different hues
                            backgroundColors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
                        });
                        
                        // Create chart
                        new Chart(chartCanvas, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Votes',
                                    data: data,
                                    backgroundColor: backgroundColors,
                                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error creating chart for category ${category.id}:`, error);
                }
            }, 50);
        }
        
        sortedNominees.forEach(nominee => {
            const voteCount = categoryVotes[nominee] || 0;
            
            const nomineeResult = document.createElement('div');
            nomineeResult.classList.add('result-nominee');
            nomineeResult.innerHTML = `
                <span class="result-nominee-name">${nominee}</span>
                <span class="result-nominee-votes">${voteCount} vote${voteCount !== 1 ? 's' : ''}</span>
            `;
            
            // Add view voters button for admin
            if (voteCount > 0) {
                const viewVotersBtn = document.createElement('button');
                viewVotersBtn.classList.add('view-voters-btn');
                viewVotersBtn.innerHTML = '<i class="fas fa-users"></i> View Voters';
                viewVotersBtn.addEventListener('click', () => {
                    showVotersForNominee(category.id, nominee);
                });
                nomineeResult.appendChild(viewVotersBtn);
            }
            
            nomineesResults.appendChild(nomineeResult);
        });
        
        // Add nominees list after chart
        resultCard.appendChild(nomineesResults);
        
        // Add card to container
        resultsWrapper.appendChild(resultCard);
    });
}

function updateStatistics() {
    try {
        // Safety check - make sure votes is an object
        if (!votes || typeof votes !== 'object') {
            console.warn('Invalid votes object in updateStatistics:', votes);
            return;
        }
        
        // Calculate total votes - safely handle potentially malformed data
        let totalVotes = 0;
        try {
            totalVotes = Object.values(votes).reduce((total, userVotes) => {
                if (!userVotes || typeof userVotes !== 'object') return total;
                return total + Object.keys(userVotes).length;
            }, 0);
        } catch (error) {
            console.error('Error calculating total votes:', error);
            totalVotes = 0;
        }
        
        // Calculate students voted
        const studentsVoted = Object.keys(votes).length;
        
        // Find most popular category
        const categoryCounts = {};
        try {
            Object.values(votes).forEach(userVotes => {
                if (!userVotes || typeof userVotes !== 'object') return;
                
                Object.keys(userVotes).forEach(categoryId => {
                    if (categoryId) {
                        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
                    }
                });
            });
        } catch (error) {
            console.error('Error counting category votes:', error);
        }
        
        let popularCategoryId = null;
        let maxVotes = 0;
        
        for (const [categoryId, count] of Object.entries(categoryCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                popularCategoryId = categoryId;
            }
        }
        
        let popularCategory = '-';
        if (popularCategoryId && categories) {
            const foundCategory = categories.find(c => c && c.id === parseInt(popularCategoryId));
            popularCategory = foundCategory?.name || '-';
        }
        
        // Update UI
        if (totalVotesEl) totalVotesEl.textContent = totalVotes;
        if (studentsVotedEl) studentsVotedEl.textContent = `${studentsVoted}/60`;
        if (popularCategoryEl) popularCategoryEl.textContent = popularCategory;
        
        // Create/update charts
        try {
            // Destroy existing charts to prevent duplicates
            if (window.categoryChart) window.categoryChart.destroy();
            if (window.topNomineesChart) window.topNomineesChart.destroy();
            if (window.activityChart) window.activityChart.destroy();
            
            // 1. Category Votes Chart - shows votes per category
            const categoryVotesCanvas = document.getElementById('category-votes-chart');
            if (categoryVotesCanvas) {
                // Get top categories by vote count
                const topCategories = Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 7);
                
                const categoryLabels = [];
                const categoryData = [];
                const categoryColors = [];
                
                topCategories.forEach(([categoryId, count], index) => {
                    const category = categories.find(c => c.id == categoryId);
                    if (category) {
                        categoryLabels.push(category.name.split(' ')[0]); // First word for clarity
                        categoryData.push(count);
                        const hue = 180 + (index * 30) % 180;
                        categoryColors.push(`hsla(${hue}, 70%, 50%, 0.7)`);
                    }
                });
                
                window.categoryChart = new Chart(categoryVotesCanvas, {
                    type: 'bar',
                    data: {
                        labels: categoryLabels,
                        datasets: [{
                            label: 'Votes',
                            data: categoryData,
                            backgroundColor: categoryColors
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: false,
                                text: 'Votes by Category'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
            
            // 2. Top Nominees Chart - shows top nominees across all categories
            const topNomineesCanvas = document.getElementById('top-nominees-chart');
            if (topNomineesCanvas) {
                // Count votes for each nominee across all categories
                const nomineeVotes = {};
                
                Object.values(votes).forEach(userVotes => {
                    if (!userVotes || typeof userVotes !== 'object') return;
                    
                    Object.entries(userVotes).forEach(([categoryId, nomineeId]) => {
                        if (!categoryId || !nomineeId) return;
                        
                        const category = categories.find(c => c.id == categoryId);
                        if (category) {
                            let nomineeName;
                            
                            // Handle different nominee formats (index or name)
                            if (typeof nomineeId === 'number') {
                                nomineeName = category.nominees[nomineeId - 1];
                            } else {
                                nomineeName = nomineeId;
                            }
                            
                            if (nomineeName) {
                                nomineeVotes[nomineeName] = (nomineeVotes[nomineeName] || 0) + 1;
                            }
                        }
                    });
                });
                
                // Get top nominees
                const topNominees = Object.entries(nomineeVotes)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                
                const nomineeLabels = [];
                const nomineeData = [];
                const nomineeColors = [];
                
                topNominees.forEach(([name, count], index) => {
                    nomineeLabels.push(name);
                    nomineeData.push(count);
                    const hue = 250 + (index * 30) % 110;
                    nomineeColors.push(`hsla(${hue}, 70%, 50%, 0.7)`);
                });
                
                window.topNomineesChart = new Chart(topNomineesCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: nomineeLabels,
                        datasets: [{
                            data: nomineeData,
                            backgroundColor: nomineeColors,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    boxWidth: 12,
                                    font: {
                                        size: 10
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // 3. Voting Activity Chart - simulate activity over time
            const activityCanvas = document.getElementById('voting-activity-chart');
            if (activityCanvas) {
                // Create simulated time data since we don't have actual timestamps
                const hours = 10;
                const labels = [];
                const data = [];
                
                for (let i = 0; i < hours; i++) {
                    labels.push(`${i+1}h`);
                    // Create a distribution to simulate voting activity
                    const hourActivity = studentsVoted * 
                        Math.max(0, Math.min(1, 0.5 + 0.5 * Math.sin((i / hours) * Math.PI * 2)));
                    data.push(Math.round(hourActivity));
                }
                
                window.activityChart = new Chart(activityCanvas, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Votes',
                            data: data,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 5
                                }
                            }
                        }
                    }
                });
            }
        } catch (chartError) {
            console.error('Error creating dashboard charts:', chartError);
        }
    } catch (error) {
        console.error('Error in updateStatistics:', error);
    }
}

async function handleVote(categoryId, nomineeId) {
    try {
        console.log(`Submitting vote: Category ${categoryId}, Nominee ${nomineeId}`);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                categoryId: categoryId.toString(), 
                nomineeId 
            })
        });

        if (!response.ok) {
            throw new Error('Failed to record vote');
        }

        // Update local votes object
        votes[categoryId.toString()] = nomineeId;
        console.log('Updated votes object after voting:', votes);
        
        // Show success message
        showVoteSuccess();
        
        // Update UI
        renderCategories();
    } catch (error) {
        console.error('Error recording vote:', error);
        showError(error.message || 'Failed to record vote. Please try again.');
    }
}

function getUserVoteForCategory(categoryId) {
    const categoryIdStr = categoryId.toString();
    if (!votes[categoryIdStr]) return null;
    return votes[categoryIdStr];
}

function getCategoryVotes(categoryId) {
    if (categoryId === null || categoryId === undefined) {
        console.warn('Invalid categoryId provided to getCategoryVotes:', categoryId);
        return {};
    }
    
    const categoryIdStr = categoryId.toString();
    const categoryVotes = {};
    
    // Different structure depending on if we're in admin or student view
    if (currentUser && currentUser.id === ADMIN_CODE) {
        // In admin view, votes is organized by categoryId -> userId -> nomineeId
        const categoryData = votes[categoryIdStr] || {};
        
        // Count votes for each nominee
        Object.values(categoryData).forEach(nomineeId => {
            // Skip null or undefined nomineeId values
            if (nomineeId === null || nomineeId === undefined) {
                console.warn('Skipping invalid nomineeId in category', categoryIdStr);
                return;
            }
            categoryVotes[nomineeId] = (categoryVotes[nomineeId] || 0) + 1;
        });
    } else {
        // In student view, votes is directly categoryId -> nomineeId
        if (votes[categoryIdStr]) {
            const nominee = votes[categoryIdStr];
            if (nominee !== null && nominee !== undefined) {
                categoryVotes[nominee] = 1;
            }
        }
    }
    
    return categoryVotes;
}

function showVoteSuccess() {
    // Create a success notification
    const notification = document.createElement('div');
    notification.classList.add('vote-notification');
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Vote recorded!</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2000);
}

function updateVoteDisplay(categoryId) {
    // Implementation of updateVoteDisplay method
}

function showVotersForNominee(categoryId, nominee) {
    // Validate parameters
    if (categoryId === null || categoryId === undefined || nominee === null || nominee === undefined) {
        console.warn('Invalid parameters for showVotersForNominee:', { categoryId, nominee });
        return;
    }
    
    // Find the category
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        console.warn('Category not found:', categoryId);
        return;
    }
    
    // Get all voters for this nominee
    const voters = [];
    const categoryIdStr = categoryId.toString();
    
    // If this category exists in votes
    if (votes[categoryIdStr]) {
        // Iterate through all users who voted for this category
        Object.entries(votes[categoryIdStr]).forEach(([userId, nomineeId]) => {
            // Skip invalid entries
            if (userId === null || userId === undefined || nomineeId === null || nomineeId === undefined) {
                console.warn('Invalid vote entry found:', { userId, nomineeId });
                return;
            }
            
            // If this user voted for the specified nominee
            if (nomineeId === nominee) {
                try {
                    // Find student name
                    const parsedUserId = parseInt(userId);
                    const student = students.find(s => s.id === parsedUserId);
                    if (student) {
                        voters.push(student.name);
                    } else {
                        console.warn('Student not found for ID:', parsedUserId);
                    }
                } catch (error) {
                    console.error('Error processing voter:', error);
                }
            }
        });
    }
    
    // Create modal for showing voters
    const modal = document.createElement('div');
    modal.classList.add('voters-modal');
    
    modal.innerHTML = `
        <div class="voters-modal-content">
            <div class="voters-modal-header">
                <h3>Voters for "${nominee}" in ${category.name}</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="voters-modal-body">
                ${voters.length > 0 
                    ? `<ul>${voters.map(voter => `<li>${voter}</li>`).join('')}</ul>` 
                    : '<p>No voters found</p>'}
            </div>
        </div>
    `;
    
    // Add close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add to body
    document.body.appendChild(modal);
}

const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    
    .vote-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }
    
    .vote-notification i {
        font-size: 1.2rem;
    }
    
    .vote-notification.fade-out {
        animation: fadeOut 0.5s forwards;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Auto logout after 10 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (currentUser) {
        inactivityTimer = setTimeout(handleLogout, 10 * 60 * 1000); // 10 minutes
    }
}

// Add event listeners for activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);

// Initialize inactivity timer
resetInactivityTimer();

function updateNavigation() {
    // Update current category number
    currentCategoryEl.textContent = currentCategoryIndex + 1;
    
    // Update progress bar
    const progress = ((currentCategoryIndex + 1) / categories.length) * 100;
    categoryProgressBar.style.width = `${progress}%`;
    
    // Enable/disable navigation buttons
    prevCategoryBtn.disabled = currentCategoryIndex === 0;
    nextCategoryBtn.disabled = currentCategoryIndex === categories.length - 1;
}

function showPreviousCategory() {
    if (currentCategoryIndex > 0) {
        // Hide current category
        document.getElementById(`category-${categories[currentCategoryIndex].id}`).style.display = 'none';
        
        // Show previous category
        currentCategoryIndex--;
        document.getElementById(`category-${categories[currentCategoryIndex].id}`).style.display = 'block';
        
        // Update navigation
        updateNavigation();
    }
}

function showNextCategory() {
    if (currentCategoryIndex < categories.length - 1) {
        // Hide current category
        document.getElementById(`category-${categories[currentCategoryIndex].id}`).style.display = 'none';
        
        // Show next category
        currentCategoryIndex++;
        document.getElementById(`category-${categories[currentCategoryIndex].id}`).style.display = 'block';
        
        // Update navigation
        updateNavigation();
    }
}

// Function to show confirmation dialog for resetting votes
function confirmResetVotes() {
    console.log('Opening reset votes confirmation dialog');
    
    // Create a modal for confirmation
    const modal = document.createElement('div');
    modal.className = 'voters-modal';
    
    modal.innerHTML = `
        <div class="voters-modal-content">
            <div class="voters-modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Reset All Votes</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="voters-modal-body">
                <p>Are you sure you want to reset all votes? This action cannot be undone.</p>
                <div class="modal-buttons">
                    <button class="btn cancel-btn">Cancel</button>
                    <button class="btn confirm-reset-btn">Yes, Reset All Votes</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Function to close the modal
    const closeModal = () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    };
    
    // Setup event listeners - using try/catch to prevent any errors
    try {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        const cancelBtn = modal.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        const confirmBtn = modal.querySelector('.confirm-reset-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                console.log('Confirm reset button clicked');
                await resetAllVotes();
                closeModal();
                
                // Force refresh of admin dashboard
                try {
                    if (currentUser?.id === ADMIN_CODE) {
                        console.log('Refreshing admin dashboard after reset');
                        await showAdminDashboard();
                    }
                } catch (error) {
                    console.error('Error refreshing dashboard after reset:', error);
                }
            });
        }
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    } catch (error) {
        console.error('Error setting up reset confirmation dialog:', error);
    }
}

// Function to reset all votes
async function resetAllVotes() {
    try {
        console.log('Resetting all votes');
        
        if (LOCAL_MODE) {
            // In local mode, just clear the votes in localStorage
            // Define the key to match what's in localApi.js
            const LOCAL_VOTES_KEY = 'cse6_local_votes';
            
            // Try both direct access and API approach
            try {
                console.log('Direct localStorage reset attempt');
                localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify({}));
                console.log('Direct reset successful');
            } catch (localError) {
                console.error('Error with direct localStorage reset:', localError);
            }
            
            // Also try the API approach to make sure we reset properly
            console.log('API-based reset attempt (local mode)');
            const token = localStorage.getItem('token');
            console.log('Using token for reset:', token);
            
            const response = await fetch(`${API_URL}/admin/reset-votes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('API reset successful (local mode)');
            } else {
                console.error('API reset failed (local mode):', await response.text());
            }
            
            // Regardless of method, clear memory
            votes = {};
            console.log('All votes have been reset in local mode');
        } else {
            // In production mode, call the API to reset votes
            const token = localStorage.getItem('token');
            console.log('Using token for reset (production):', token);
            
            const response = await fetch(`${API_URL}/admin/reset-votes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Reset API error:', errorText);
                throw new Error('Failed to reset votes: ' + errorText);
            }
            
            console.log('All votes have been reset in the database');
            
            // Clear votes from memory
            votes = {};
        }
        
        // Show success message
        showNotification('All votes have been reset successfully!');
        
        // Refresh admin dashboard to show updated data
        renderResults();
        updateStatistics();
        
        return true; // indicate success
    } catch (error) {
        console.error('Error resetting votes:', error);
        showError('Failed to reset votes. Please try again.');
        return false; // indicate failure
    }
}

// Function to show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'vote-notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add CSS for reset button and modal
const resetStyle = document.createElement('style');
resetStyle.textContent = `
    .reset-btn {
        background-color: #dc3545 !important;
        color: white !important;
        margin-right: 10px;
    }
    
    .reset-btn:hover {
        background-color: #c82333 !important;
    }
    
    .reset-btn i {
        margin-right: 5px;
    }
    
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    .cancel-btn {
        background-color: #6c757d !important;
        color: white !important;
    }
    
    .confirm-reset-btn {
        background-color: #dc3545 !important;
        color: white !important;
    }
    
    .cancel-btn:hover {
        background-color: #5a6268 !important;
    }
    
    .confirm-reset-btn:hover {
        background-color: #c82333 !important;
    }
`;
document.head.appendChild(resetStyle);

// Add CSS for winners button
const winnersStyle = document.createElement('style');
winnersStyle.textContent = `
    .winners-btn {
        background-color: #ffc107 !important;
        color: #000 !important;
        margin-right: 10px;
    }
    
    .winners-btn:hover {
        background-color: #e0a800 !important;
    }
    
    .winners-btn i {
        margin-right: 8px;
    }
`;
document.head.appendChild(winnersStyle); 

// Add auto-refresh for admin dashboard
let adminRefreshInterval;

function startAdminRefresh() {
    if (currentUser?.id === ADMIN_CODE) {
        adminRefreshInterval = setInterval(async () => {
            await showAdminDashboard();
        }, 30000); // Refresh every 30 seconds
    }
}

function stopAdminRefresh() {
    if (adminRefreshInterval) {
        clearInterval(adminRefreshInterval);
    }
}

// Update the existing showAdminDashboard function to start refresh
const originalShowAdminDashboard = showAdminDashboard;
showAdminDashboard = async function() {
    await originalShowAdminDashboard();
    startAdminRefresh();
};

// Update the existing handleLogout function to stop refresh
const originalHandleLogout = handleLogout;
handleLogout = function() {
    stopAdminRefresh();
    originalHandleLogout();
};

// Add loading spinner styles
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .fa-spin {
        animation: spin 1s linear infinite;
    }
    .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(spinnerStyle); 

// Function to add Reset Votes button to admin dashboard
function addResetButton() {
    console.log('Adding reset button to admin dashboard');
    
    // Wait for DOM to be ready
    setTimeout(() => {
        try {
            // Check if button already exists
            if (document.getElementById('reset-votes-btn')) {
                console.log('Reset button already exists, skipping creation');
                return;
            }
            
            // Get the admin controls container
            const adminControls = document.querySelector('.admin-controls');
            if (!adminControls) {
                console.error('Admin controls not found');
                return;
            }
            
            console.log('Creating reset votes button for admin dashboard');
            
            // Create the reset button
            const resetButton = document.createElement('button');
            resetButton.id = 'reset-votes-btn';
            resetButton.className = 'btn reset-btn';
            resetButton.innerHTML = '<i class="fas fa-trash-alt"></i> Reset All Votes';
            resetButton.style.display = 'inline-block';
            resetButton.style.marginRight = '10px';
            
            // Add event listener
            resetButton.addEventListener('click', function() {
                console.log('Reset votes button clicked');
                confirmResetVotes();
            });
            
            // Insert at beginning of admin controls
            if (adminControls.firstChild) {
                adminControls.insertBefore(resetButton, adminControls.firstChild);
            } else {
                adminControls.appendChild(resetButton);
            }
            
            console.log('Reset votes button added to admin dashboard');
        } catch (error) {
            console.error('Error adding reset button:', error);
        }
    }, 500); // Wait for DOM to be ready
} 