// Function to send WhatsApp message with student ID
async function sendWhatsAppMessage(studentId) {
    // Find student by ID
    const student = students.find(s => s.id === studentId);
    
    if (!student || !student.phone) {
        console.error('Student not found or phone number not available');
        return false;
    }

    try {
        // Create the message
        const message = `Hello ${student.name}, your CSE6 Poll System ID is: ${student.id}`;
        
        // Format phone number (remove spaces and ensure it starts with 91)
        let phoneNumber = student.phone.replace(/\s+/g, '');
        if (!phoneNumber.startsWith('91')) {
            phoneNumber = '91' + phoneNumber;
        }
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in a new window
        window.open(whatsappURL, '_blank');
        
        // Add a small delay to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

// Function to create WhatsApp link
function createWhatsAppLink(student) {
    // Format phone number (remove spaces and ensure it starts with 91)
    let phoneNumber = student.phone.replace(/\s+/g, '');
    if (!phoneNumber.startsWith('91')) {
        phoneNumber = '91' + phoneNumber;
    }
    
    // Create the festive message
    const message = `🎉 Hilaria 2k25 – The DEBBA DEBBA Awards! 🏆🥳

Hey ${student.name} 👋,

Brace yourself for the most legendary and unforgettable event of the Sem – The DEBBA DEBBA Awards! 🌟🎭

🔐 Your VIP Access Code: ${student.id}
🌐 Website: https://hilariawards.netlify.app/

Let's make this celebration epic! 🎊`;
    
    // Create WhatsApp URL
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

// Function to show WhatsApp links modal
function showWhatsAppLinksModal(studentsWithPhones) {
    // Create modal container
    const modal = document.createElement('div');
    modal.classList.add('whatsapp-modal');
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('whatsapp-modal-content');
    
    // Add header
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Send IDs via WhatsApp</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <p>Click each link below to send the ID to each student:</p>
            <div class="whatsapp-links">
                ${studentsWithPhones.map((student, index) => `
                    <div class="whatsapp-link-item">
                        <span class="student-number">${index + 1}.</span>
                        <span class="student-name">${student.name}</span>
                        <a href="${createWhatsAppLink(student)}" target="_blank" class="whatsapp-link">
                            <i class="fab fa-whatsapp"></i> Send ID
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="modal-footer">
            <button class="open-all-btn">Open All Links</button>
        </div>
    `;
    
    // Add modal to container
    modal.appendChild(modalContent);
    
    // Add close functionality
    const closeBtn = modalContent.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Add open all functionality
    const openAllBtn = modalContent.querySelector('.open-all-btn');
    openAllBtn.addEventListener('click', () => {
        studentsWithPhones.forEach(student => {
            window.open(createWhatsAppLink(student), '_blank');
        });
    });
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .whatsapp-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .whatsapp-modal-content {
            background: #1a1a2e;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #fff;
        }
        
        .close-modal {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        
        .whatsapp-links {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .whatsapp-link-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }
        
        .student-number {
            color: #a0a0a0;
            min-width: 30px;
        }
        
        .student-name {
            color: #fff;
            flex: 1;
        }
        
        .whatsapp-link {
            background: #25D366;
            color: white;
            padding: 5px 15px;
            border-radius: 5px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .whatsapp-link:hover {
            background: #128C7E;
        }
        
        .modal-footer {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
        }
        
        .open-all-btn {
            background: #25D366;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .open-all-btn:hover {
            background: #128C7E;
        }
    `;
    document.head.appendChild(modalStyle);
}

// Function to handle sending IDs
function sendAllStudentIds() {
    // Get all students with phone numbers
    const studentsWithPhones = students.filter(student => student.phone && student.phone.trim() !== '');
    
    if (studentsWithPhones.length === 0) {
        showNotification('No students with phone numbers found.');
        return;
    }
    
    // Show the modal with all WhatsApp links
    showWhatsAppLinksModal(studentsWithPhones);
}

// Add a button to admin dashboard to send IDs
function addSendIdButton() {
    if (document.getElementById('send-id-btn')) return;
    
    const adminControls = document.querySelector('.admin-controls');
    if (!adminControls) return;
    
    const sendButton = document.createElement('button');
    sendButton.id = 'send-id-btn';
    sendButton.classList.add('btn', 'send-id-btn');
    sendButton.innerHTML = '<i class="fab fa-whatsapp"></i> Send IDs via WhatsApp';
    
    sendButton.addEventListener('click', sendAllStudentIds);
    
    adminControls.insertBefore(sendButton, adminControls.firstChild);
}

// Show notification function
function showNotification(message) {
    // Remove any existing notifications first
    const existingNotification = document.querySelector('.vote-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.classList.add('vote-notification');
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Only start the removal timeout for completion messages
    if (message.includes('Completed!')) {
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
}

// Add the button when admin dashboard is shown
document.addEventListener('DOMContentLoaded', () => {
    // If admin is already logged in, add the button
    if (currentUser && currentUser.id === ADMIN_CODE) {
        addSendIdButton();
    }
});

// Add CSS for the send ID button
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
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .fa-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style); 