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

// Initialize the app
initializeApp();

// Event Listeners
loginBtn.addEventListener('click', handleLogin);
studentLogoutBtn.addEventListener('click', handleLogout);
adminLogoutBtn.addEventListener('click', handleLogout);
searchInput.addEventListener('input', handleSearch);
prevCategoryBtn.addEventListener('click', showPreviousCategory);
nextCategoryBtn.addEventListener('click', showNextCategory);

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
        showError('Please enter your 6-digit code');
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
    
    // Add reset votes button if it doesn't exist
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
    
    // Render results
    renderResults();
    
    // Update statistics
    updateStatistics();
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
                    vote(category.id, nominee);
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

const style = document.createElement('style');
style.textContent = `
    .send-id-btn {
        background-color: #25D366 !important;
        color: white !important;
        margin-right: 10px;
    }
    
    .send-id-btn:hover {
        background-color: #128C7E !important;
    }
    
    .send-id-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .send-id-btn i {
        margin-right: 8px;
    }
`;
document.head.appendChild(style);

// Add new functions for reset functionality
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