// Password Reset Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add password reset link to the login page
    const loginFooter = document.querySelector('.login-footer');
    const resetLink = document.createElement('p');
    resetLink.innerHTML = '<a href="#" id="forgot-password">Forgot Password?</a>';
    resetLink.style.marginTop = '10px';
    resetLink.style.fontSize = '0.9rem';
    resetLink.style.textAlign = 'center';
    loginFooter.appendChild(resetLink);

    // Style the link
    const linkStyle = document.createElement('style');
    linkStyle.textContent = `
        #forgot-password {
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.3s;
        }
        #forgot-password:hover {
            color: var(--secondary-color);
        }
        .password-reset-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }
        .password-reset-modal.active {
            opacity: 1;
            pointer-events: all;
        }
        .password-reset-container {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 10px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .password-reset-container h2 {
            margin-bottom: 1.5rem;
            text-align: center;
            color: var(--text-color);
        }
        .reset-btn {
            background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
            width: 100%;
        }
        .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 1.5rem;
            cursor: pointer;
        }
        .reset-success, .reset-error {
            margin-top: 1rem;
            padding: 0.8rem;
            border-radius: 5px;
            text-align: center;
            display: none;
        }
        .reset-success {
            background: rgba(0, 200, 150, 0.2);
            color: var(--success-color);
        }
        .reset-error {
            background: rgba(255, 71, 87, 0.2);
            color: var(--error-color);
        }
    `;
    document.head.appendChild(linkStyle);

    // Create the modal
    const modal = document.createElement('div');
    modal.className = 'password-reset-modal';
    modal.innerHTML = `
        <div class="password-reset-container">
            <button class="close-btn">&times;</button>
            <h2>Reset Password</h2>
            <div class="input-field">
                <input type="text" id="student-id-input" placeholder="Enter your Student ID (6 digits)">
            </div>
            <div class="input-field">
                <input type="email" id="email-input" placeholder="Enter your email">
            </div>
            <button id="reset-submit-btn" class="reset-btn">Reset Password</button>
            <div class="reset-success" id="reset-success">Password reset successful! Check your email.</div>
            <div class="reset-error" id="reset-error">Student ID not found or other error occurred.</div>
        </div>
    `;
    document.body.appendChild(modal);

    // Show modal when clicking forgot password
    document.getElementById('forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
    });

    // Close modal when clicking close button
    document.querySelector('.close-btn').addEventListener('click', function() {
        modal.classList.remove('active');
        document.getElementById('reset-success').style.display = 'none';
        document.getElementById('reset-error').style.display = 'none';
        document.getElementById('student-id-input').value = '';
        document.getElementById('email-input').value = '';
    });

    // Handle password reset submission
    document.getElementById('reset-submit-btn').addEventListener('click', function() {
        const studentId = parseInt(document.getElementById('student-id-input').value.trim());
        const email = document.getElementById('email-input').value.trim();
        
        // Check if the student ID exists
        const student = students.find(s => s.id === studentId);
        const successMessage = document.getElementById('reset-success');
        const errorMessage = document.getElementById('reset-error');
        
        // Hide previous messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        if (!student) {
            errorMessage.textContent = 'Student ID not found. Please try again.';
            errorMessage.style.display = 'block';
            return;
        }

        if (!email) {
            errorMessage.textContent = 'Please enter your email address.';
            errorMessage.style.display = 'block';
            return;
        }

        // Special handling for Mothilal
        if (student.name === "MOTHILAL") {
            // Get Mothilal's password from localStorage if it exists (set by sendPasswordToMothilal.js)
            const mothilalPassword = localStorage.getItem('mothilalPassword');
            
            if (mothilalPassword && email === "n211026@rguktn.ac.in") {
                successMessage.innerHTML = `Password has already been sent to your email (n211026@rguktn.ac.in).<br><br>
                                           For your convenience, your password is: <strong>${mothilalPassword}</strong>`;
                successMessage.style.display = 'block';
            } else if (email === "n211026@rguktn.ac.in") {
                // Redirect message to check the notification or console
                successMessage.innerHTML = `Your password has been sent to ${email}.<br><br>
                                           Please check the notification on screen or check the browser console (F12).`;
                successMessage.style.display = 'block';
            } else {
                errorMessage.textContent = 'Please use your registered RGUKT email address (n211026@rguktn.ac.in).';
                errorMessage.style.display = 'block';
            }
            return;
        }

        // Handle other students
        // ... existing code for other students ...
    });

    // Function to generate a random password
    function generateRandomPassword() {
        const length = 8;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        return password;
    }

    // Function to simulate sending an email (would be replaced with real email API)
    function sendPasswordEmail(studentName, email, password) {
        // In a real application, you would use an email API service here
        // such as SendGrid, Mailgun, AWS SES, etc.
        
        // For demonstration purposes, we're just logging the information
        console.log('SENDING EMAIL:');
        console.log('To:', email);
        console.log('Subject: CSE6 Poll System - Password Reset');
        console.log('Body:');
        console.log(`Dear ${studentName},`);
        console.log(`Your password has been reset. Your new password is: ${password}`);
        console.log('Please login with this password and change it immediately.');
        console.log('Best regards,');
        console.log('CSE6 Poll System Administrator');
    }
}); 