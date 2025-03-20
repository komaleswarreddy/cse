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

    // Load votes from localStorage
    function loadVotes() {
        const savedVotes = localStorage.getItem('votes');
        return savedVotes ? JSON.parse(savedVotes) : {};
    }

    // Get category votes
    function getCategoryVotes(categoryId) {
        const votes = loadVotes();
        const categoryVotes = {};
        
        Object.values(votes).forEach(userVotes => {
            const nominee = userVotes[categoryId];
            if (nominee) {
                categoryVotes[nominee] = (categoryVotes[nominee] || 0) + 1;
            }
        });
        
        return categoryVotes;
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
    function displayWinners() {
        // First make sure the sections are created
        setupWinnerSections();
        
        // Then populate with winner data
        categories.forEach(category => {
            const categoryVotes = getCategoryVotes(category.id);
            const sortedNominees = Object.entries(categoryVotes)
                .sort((a, b) => b[1] - a[1]);
            
            const winnersList = document.getElementById(`category${category.id}Winners`);
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
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = adminPassword.value.trim();
            
            if (password === WINNER_PASSWORD) {
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