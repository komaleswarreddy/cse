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

// State variables
let currentUser = null;
let votes = loadVotes();
let currentCategoryIndex = 0;

// Global chart references to properly clean up when switching categories
let categoryCharts = {};
let adminCharts = {};

// Initialize the app
initializeApp();

// Event Listeners
loginBtn.addEventListener('click', handleLogin);
studentLogoutBtn.addEventListener('click', handleLogout);
adminLogoutBtn.addEventListener('click', handleLogout);
searchInput.addEventListener('input', handleSearch);
prevCategoryBtn.addEventListener('click', showPreviousCategory);
nextCategoryBtn.addEventListener('click', showNextCategory);

// Input validation for 4-digit code
codeInput.addEventListener('input', function(e) {
    // Only allow numbers
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Limit to 4 digits
    if (this.value.length > 4) {
        this.value = this.value.slice(0, 4);
    }
});

// Enter key for login
codeInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

// Functions
function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.id === ADMIN_CODE) {
            showAdminDashboard();
        } else {
            showStudentDashboard();
        }
    }
}

function handleLogin() {
    const code = codeInput.value.trim();
    
    // Validate input
    if (!code) {
        showError('Please enter your 4-digit code');
        return;
    }
    
    const codeNumber = parseInt(code);
    
    // Check if it's admin
    if (codeNumber === ADMIN_CODE) {
        currentUser = { id: ADMIN_CODE, name: 'Admin' };
        saveCurrentUser();
        showAdminDashboard();
        return;
    }
    
    // Check if it's a valid student
    const student = students.find(s => s.id === codeNumber);
    if (!student) {
        showError('Invalid code. Please try again.');
        return;
    }
    
    // Valid student
    currentUser = student;
    saveCurrentUser();
    showStudentDashboard();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.opacity = 1;
    
    // Shake the input
    codeInput.classList.add('shake');
    setTimeout(() => {
        codeInput.classList.remove('shake');
    }, 500);
    
    // Clear error after 3 seconds
    setTimeout(() => {
        errorMessage.style.opacity = 0;
    }, 3000);
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

function showAdminDashboard() {
    // Hide login container and show admin dashboard
    document.querySelector('.container').style.display = 'none';
    adminDashboard.style.display = 'block';
    
    // Clean up any existing admin charts
    Object.keys(adminCharts).forEach(key => {
        if (adminCharts[key]) {
            adminCharts[key].destroy();
            delete adminCharts[key];
        }
    });
    
    // Render results
    renderResults();
    
    // Update statistics
    updateStatistics();
    
    // Create advanced analytics charts
    createAdminCharts();

    // Create reset votes button if it doesn't exist
    if (!document.getElementById('reset-votes-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-votes-btn';
        resetBtn.classList.add('btn', 'reset-btn');
        resetBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Reset All Votes';
        resetBtn.addEventListener('click', confirmResetVotes);
        
        // Add to admin controls
        const adminControls = document.querySelector('.admin-controls');
        adminControls.insertBefore(resetBtn, adminControls.firstChild);
    }
}

function handleLogout() {
    // Clear current user
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Hide dashboards and show login container
    document.querySelector('.container').style.display = 'flex';
    studentDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    
    // Clear input
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
    // Clean up previous charts to prevent memory leaks
    Object.keys(categoryCharts).forEach(key => {
        if (categoryCharts[key]) {
            categoryCharts[key].destroy();
            delete categoryCharts[key];
        }
    });
    
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
        
        // Get votes for this category to show statistics
        const categoryVotes = getCategoryVotes(category.id);
        const totalCategoryVotes = Object.values(categoryVotes).reduce((sum, count) => sum + count, 0);
        
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
                    vote(category.id, nominee);
                    // Update statistics after voting
                    renderCategories();
                }
            });
            
            nomineesDiv.appendChild(nomineeItem);
        });
        
        // Create statistics section
        const statisticsDiv = document.createElement('div');
        statisticsDiv.classList.add('category-statistics');
        
        // Only show statistics if there are votes
        if (totalCategoryVotes > 0) {
            // Sort nominees by vote count
            const sortedNominees = [...category.nominees].sort((a, b) => 
                (categoryVotes[b] || 0) - (categoryVotes[a] || 0)
            );
            
            // Find the current winner
            const winner = sortedNominees[0];
            const winnerVotes = categoryVotes[winner] || 0;
            
            // Create winner card
            const winnerCard = document.createElement('div');
            winnerCard.classList.add('winner-card');
            winnerCard.innerHTML = `
                <div class="winner-info">
                    <div class="winner-title">Current Leader</div>
                    <div class="winner-name">${winner}</div>
                    <div class="winner-votes">${winnerVotes} vote${winnerVotes !== 1 ? 's' : ''} (${Math.round((winnerVotes / totalCategoryVotes) * 100)}%)</div>
                </div>
                <div class="winner-medal">🏆</div>
            `;
            
            statisticsDiv.innerHTML = `
                <div class="category-stats-title">
                    <i class="fas fa-chart-bar"></i>
                    Current Results (${totalCategoryVotes} votes total)
                </div>
            `;
            
            statisticsDiv.appendChild(winnerCard);
            
            // Create chart controls
            const chartsHeader = document.createElement('div');
            chartsHeader.classList.add('charts-header');
            chartsHeader.innerHTML = `
                <h3>Visualization</h3>
                <div class="visualization-tabs">
                    <button class="viz-tab active" data-type="bar">Bar</button>
                    <button class="viz-tab" data-type="doughnut">Doughnut</button>
                </div>
            `;
            statisticsDiv.appendChild(chartsHeader);
            
            // Create container for the chart
            const chartContainer = document.createElement('div');
            chartContainer.classList.add('chart-container');
            chartContainer.innerHTML = `<canvas id="chart-${category.id}"></canvas>`;
            statisticsDiv.appendChild(chartContainer);
            
            // Create classic bar visualization for votes
            sortedNominees.forEach(nominee => {
                const voteCount = categoryVotes[nominee] || 0;
                const percentage = totalCategoryVotes > 0 ? ((voteCount / totalCategoryVotes) * 100).toFixed(0) : 0;
                
                const nomineeStatsDiv = document.createElement('div');
                nomineeStatsDiv.innerHTML = `
                    <div class="nominee-stats">
                        <span>${nominee}</span>
                        <span class="percentage">${percentage}%</span>
                    </div>
                    <div class="stats-bar-container">
                        <div class="stats-bar" style="width: ${percentage}%"></div>
                    </div>
                `;
                
                statisticsDiv.appendChild(nomineeStatsDiv);
            });
            
            // Add elements to category card first, so we can access the canvas element
            categoryCard.appendChild(categoryHeader);
            categoryCard.appendChild(nomineesDiv);
            categoryCard.appendChild(statisticsDiv);
            
            // Add card to container
            categoriesContainer.appendChild(categoryCard);
            
            // Now create chart after canvas is in DOM
            if (index === currentCategoryIndex) {
                // Prepare chart data
                const chartLabels = sortedNominees;
                const chartData = sortedNominees.map(nominee => categoryVotes[nominee] || 0);
                
                // Create initial bar chart
                createBarChart(category.id, chartLabels, chartData);
                
                // Add event listeners to chart tabs
                document.querySelectorAll(`#category-${category.id} .viz-tab`).forEach(tab => {
                    tab.addEventListener('click', function() {
                        // Remove active class from all tabs
                        document.querySelectorAll(`#category-${category.id} .viz-tab`).forEach(t => {
                            t.classList.remove('active');
                        });
                        
                        // Add active class to clicked tab
                        this.classList.add('active');
                        
                        // Get chart type
                        const chartType = this.getAttribute('data-type');
                        
                        // Destroy previous chart
                        if (categoryCharts[category.id]) {
                            categoryCharts[category.id].destroy();
                        }
                        
                        // Create new chart based on type
                        if (chartType === 'bar') {
                            createBarChart(category.id, chartLabels, chartData);
                        } else if (chartType === 'doughnut') {
                            createDoughnutChart(category.id, chartLabels, chartData);
                        }
                    });
                });
            }
        } else {
            statisticsDiv.innerHTML = `
                <div class="category-stats-title">
                    <i class="fas fa-info-circle"></i>
                    No votes yet in this category
                </div>
            `;
            
            // Add elements to category card
            categoryCard.appendChild(categoryHeader);
            categoryCard.appendChild(nomineesDiv);
            categoryCard.appendChild(statisticsDiv);
            
            // Add card to container
            categoriesContainer.appendChild(categoryCard);
        }
    });
    
    // Update navigation controls whenever categories are rendered
    updateNavigation();
}

function createBarChart(categoryId, labels, data) {
    const ctx = document.getElementById(`chart-${categoryId}`).getContext('2d');
    
    // Define gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(121, 40, 202, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 0, 128, 0.8)');
    
    categoryCharts[categoryId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    bodyFont: {
                        family: 'Poppins'
                    },
                    titleFont: {
                        family: 'Poppins'
                    },
                    padding: 10,
                    caretSize: 5,
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        },
                        // If many nominees, show fewer labels
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value, index, values) {
                            const label = this.getLabelForValue(value);
                            if (label.length > 10) {
                                return label.substr(0, 10) + '...';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function createDoughnutChart(categoryId, labels, data) {
    const ctx = document.getElementById(`chart-${categoryId}`).getContext('2d');
    
    // Create doughnut-specific container
    const chartContainer = document.querySelector(`#category-${categoryId} .chart-container`);
    chartContainer.className = 'chart-container doughnut-chart-container';
    
    // Define colors array
    const colors = [
        'rgba(121, 40, 202, 0.8)',
        'rgba(255, 0, 128, 0.8)',
        'rgba(0, 200, 150, 0.8)',
        'rgba(255, 183, 0, 0.8)',
        'rgba(0, 116, 217, 0.8)',
        'rgba(240, 18, 190, 0.8)',
        'rgba(127, 219, 255, 0.8)',
        'rgba(61, 153, 112, 0.8)',
        'rgba(255, 133, 27, 0.8)',
        'rgba(100, 65, 165, 0.8)'
    ];
    
    categoryCharts[categoryId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: 'rgba(26, 26, 46, 0.7)',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        boxWidth: 10,
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    bodyFont: {
                        family: 'Poppins'
                    },
                    titleFont: {
                        family: 'Poppins'
                    },
                    padding: 10,
                    caretSize: 5,
                    cornerRadius: 6,
                    displayColors: false
                }
            }
        }
    });
}

function renderResults() {
    // Clean up any previous charts
    Object.keys(categoryCharts).forEach(key => {
        if (categoryCharts[key]) {
            categoryCharts[key].destroy();
            delete categoryCharts[key];
        }
    });
    
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
        
        // Create chart if there are votes
        if (totalVotes > 0) {
            // Extract data for chart
            const nominees = sortedNominees.slice(0, 5); // Only top 5 for better visibility
            const votes = nominees.map(nominee => categoryVotes[nominee] || 0);
            
            // Create mini chart
            createMiniDoughnutChart(category.id, nominees, votes);
        }
    });
}

function createMiniDoughnutChart(categoryId, labels, data) {
    const ctx = document.getElementById(`result-chart-${categoryId}`).getContext('2d');
    
    // Define colors
    const colors = [
        'rgba(121, 40, 202, 0.8)',
        'rgba(255, 0, 128, 0.8)',
        'rgba(0, 200, 150, 0.8)',
        'rgba(255, 183, 0, 0.8)',
        'rgba(0, 116, 217, 0.8)'
    ];
    
    categoryCharts[`result-${categoryId}`] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(26, 26, 46, 0.7)',
                borderWidth: 1,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        boxWidth: 10,
                        padding: 5
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    bodyFont: {
                        family: 'Poppins',
                        size: 11
                    },
                    titleFont: {
                        family: 'Poppins',
                        size: 12
                    },
                    padding: 8,
                    caretSize: 5,
                    cornerRadius: 6,
                    displayColors: false
                }
            }
        }
    });
}

function updateStatistics() {
    // Calculate total votes
    const totalVotes = Object.values(votes).reduce((total, userVotes) => 
        total + Object.keys(userVotes).length, 0
    );
    
    // Calculate students voted
    const studentsVoted = Object.keys(votes).length;
    
    // Find most popular category
    const categoryCounts = {};
    Object.values(votes).forEach(userVotes => {
        Object.keys(userVotes).forEach(categoryId => {
            categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        });
    });
    
    let popularCategoryId = null;
    let maxVotes = 0;
    
    for (const [categoryId, count] of Object.entries(categoryCounts)) {
        if (count > maxVotes) {
            maxVotes = count;
            popularCategoryId = categoryId;
        }
    }
    
    const popularCategory = categories.find(c => c.id === parseInt(popularCategoryId))?.name || '-';
    
    // Update UI
    totalVotesEl.textContent = totalVotes;
    studentsVotedEl.textContent = `${studentsVoted}/60`;
    popularCategoryEl.textContent = popularCategory;
}

function vote(categoryId, nominee) {
    // Create user's vote object if it doesn't exist
    if (!votes[currentUser.id]) {
        votes[currentUser.id] = {};
    }
    
    // Add or update vote
    votes[currentUser.id][categoryId] = nominee;
    
    // Save votes
    saveVotes();
    
    // Show success animation
    showVoteSuccess();
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

function getUserVoteForCategory(categoryId) {
    if (!votes[currentUser.id]) return null;
    return votes[currentUser.id][categoryId];
}

function getCategoryVotes(categoryId) {
    const categoryVotes = {};
    
    Object.values(votes).forEach(userVotes => {
        const nominee = userVotes[categoryId];
        if (nominee) {
            categoryVotes[nominee] = (categoryVotes[nominee] || 0) + 1;
        }
    });
    
    return categoryVotes;
}

function loadVotes() {
    const savedVotes = localStorage.getItem('votes');
    return savedVotes ? JSON.parse(savedVotes) : {};
}

function saveVotes() {
    localStorage.setItem('votes', JSON.stringify(votes));
}

function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Add CSS for vote notification
const styleElement = document.createElement('style');
styleElement.textContent = `
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
document.head.appendChild(styleElement);

// Auto logout after 10 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (currentUser) {
        inactivityTimer = setTimeout(handleLogout, 10 * 60 * 1000); // 10 minutes
    }
}

// Reset timer on user activity
['click', 'keypress', 'mousemove', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Initial timer start
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
    
    // If this is the last category, change Next button text
    if (currentCategoryIndex === categories.length - 1) {
        nextCategoryBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
    } else {
        nextCategoryBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    }
}

function showPreviousCategory() {
    if (currentCategoryIndex > 0) {
        // Hide current category
        document.querySelector(`#category-${categories[currentCategoryIndex].id}`).style.display = 'none';
        
        // Decrease index
        currentCategoryIndex--;
        
        // Show previous category
        document.querySelector(`#category-${categories[currentCategoryIndex].id}`).style.display = 'block';
        
        // Update navigation
        updateNavigation();
        
        // Scroll to top of the category
        window.scrollTo({ top: categoriesContainer.offsetTop - 100, behavior: 'smooth' });
    }
}

function showNextCategory() {
    if (currentCategoryIndex < categories.length - 1) {
        // Hide current category
        document.querySelector(`#category-${categories[currentCategoryIndex].id}`).style.display = 'none';
        
        // Increase index
        currentCategoryIndex++;
        
        // Show next category
        document.querySelector(`#category-${categories[currentCategoryIndex].id}`).style.display = 'block';
        
        // Update navigation
        updateNavigation();
        
        // Scroll to top of the category
        window.scrollTo({ top: categoriesContainer.offsetTop - 100, behavior: 'smooth' });
    }
}

function createAdminCharts() {
    // 1. Create Category Votes Chart
    createCategoryVotesChart();
    
    // 2. Create Top Nominees Chart
    createTopNomineesChart();
    
    // 3. Create Voting Activity Chart (dummy data as we don't track voting time)
    createVotingActivityChart();
}

function createCategoryVotesChart() {
    const ctx = document.getElementById('category-votes-chart').getContext('2d');
    
    // Collect data: total votes per category
    const categoryNames = categories.map(c => c.name);
    const categoryVoteCounts = categories.map(category => {
        const categoryVotes = getCategoryVotes(category.id);
        return Object.values(categoryVotes).reduce((sum, count) => sum + count, 0);
    });
    
    // Create bar chart
    adminCharts['categoryVotes'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryNames,
            datasets: [{
                label: 'Total Votes',
                data: categoryVoteCounts,
                backgroundColor: 'rgba(121, 40, 202, 0.7)',
                borderColor: 'rgba(121, 40, 202, 1)',
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    bodyFont: {
                        family: 'Poppins'
                    },
                    titleFont: {
                        family: 'Poppins'
                    },
                    padding: 10,
                    caretSize: 5,
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Votes',
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value, index, values) {
                            const label = this.getLabelForValue(value);
                            if (label.length > 15) {
                                return label.substr(0, 15) + '...';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function createTopNomineesChart() {
    const ctx = document.getElementById('top-nominees-chart').getContext('2d');
    
    // Collect all votes across all categories
    const allNominees = {};
    
    categories.forEach(category => {
        const categoryVotes = getCategoryVotes(category.id);
        
        // Add votes to the nominee totals
        for (const [nominee, voteCount] of Object.entries(categoryVotes)) {
            allNominees[nominee] = (allNominees[nominee] || 0) + voteCount;
        }
    });
    
    // Sort nominees by total votes and get top 10
    const sortedNominees = Object.entries(allNominees)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const nomineeNames = sortedNominees.map(entry => entry[0]);
    const nomineeVotes = sortedNominees.map(entry => entry[1]);
    
    // Define colors array
    const colors = [
        'rgba(121, 40, 202, 0.8)',
        'rgba(255, 0, 128, 0.8)',
        'rgba(0, 200, 150, 0.8)',
        'rgba(255, 183, 0, 0.8)',
        'rgba(0, 116, 217, 0.8)',
        'rgba(240, 18, 190, 0.8)',
        'rgba(127, 219, 255, 0.8)',
        'rgba(61, 153, 112, 0.8)',
        'rgba(255, 133, 27, 0.8)',
        'rgba(100, 65, 165, 0.8)'
    ];
    
    // Create horizontal bar chart
    adminCharts['topNominees'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomineeNames,
            datasets: [{
                label: 'Total Votes',
                data: nomineeVotes,
                backgroundColor: colors.slice(0, nomineeNames.length),
                borderWidth: 1,
                borderRadius: 5,
                borderColor: 'rgba(26, 26, 46, 0.7)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    bodyFont: {
                        family: 'Poppins'
                    },
                    titleFont: {
                        family: 'Poppins'
                    },
                    padding: 10,
                    caretSize: 5,
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Votes',
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        }
                    }
                }
            }
        }
    });
}

function createVotingActivityChart() {
    const ctx = document.getElementById('voting-activity-chart').getContext('2d');
    
    // Since we don't track voting timestamps, we'll generate some sample data
    // for visualization purposes
    const categories_count = categories.length;
    const data = [];
    
    // Generate random data for each category (simulating voting activity over time)
    for (let i = 0; i < categories_count; i++) {
        const activityValue = Math.floor(Math.random() * 40) + 10; // Random value between 10-50
        data.push(activityValue);
    }
    
    // Create the line chart
    adminCharts['votingActivity'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: categories.map(c => c.name),
            datasets: [{
                label: 'Voting Activity',
                data: data,
                borderColor: 'rgba(255, 0, 128, 1)',
                backgroundColor: 'rgba(255, 0, 128, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(255, 0, 128, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    bodyFont: {
                        family: 'Poppins'
                    },
                    titleFont: {
                        family: 'Poppins'
                    },
                    padding: 10,
                    caretSize: 5,
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Activity Level',
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Poppins'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value, index, values) {
                            const label = this.getLabelForValue(value);
                            if (label.length > 10) {
                                return label.substr(0, 10) + '...';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// New function to show voters for a specific nominee
function showVotersForNominee(categoryId, nominee) {
    // Find the category
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Get all voters for this nominee
    const voters = [];
    
    Object.entries(votes).forEach(([userId, userVotes]) => {
        if (userVotes[categoryId] === nominee) {
            // Find student name
            const student = students.find(s => s.id === parseInt(userId));
            if (student) {
                voters.push(student.name);
            }
        }
    });
    
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

// New function to confirm reset votes
function confirmResetVotes() {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.classList.add('voters-modal');
    
    modal.innerHTML = `
        <div class="voters-modal-content">
            <div class="voters-modal-header">
                <h3>Reset All Votes</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="voters-modal-body">
                <p>Are you sure you want to reset all votes? This action cannot be undone.</p>
                <div class="modal-buttons">
                    <button class="btn cancel-btn">Cancel</button>
                    <button class="btn confirm-reset-btn">Reset All Votes</button>
                </div>
            </div>
        </div>
    `;
    
    // Add close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Add cancel button functionality
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Add confirm reset functionality
    modal.querySelector('.confirm-reset-btn').addEventListener('click', () => {
        resetAllVotes();
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

// New function to reset all votes
function resetAllVotes() {
    // Reset votes
    votes = {};
    saveVotes();
    
    // Show success notification
    const notification = document.createElement('div');
    notification.classList.add('vote-notification');
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>All votes have been reset!</span>
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
    
    // Refresh admin dashboard
    renderResults();
    updateStatistics();
    createAdminCharts();
} 