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
    modal.className = 'whatsapp-links-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'whatsapp-modal-content';
    
    // Create close button
    const closeButton = document.createElement('span');
    closeButton.className = 'whatsapp-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = 'Send Student IDs via WhatsApp';
    
    // Create list container
    const listContainer = document.createElement('div');
    listContainer.className = 'whatsapp-links-list';
    
    // Add students to list
        studentsWithPhones.forEach(student => {
        const listItem = document.createElement('div');
        listItem.className = 'whatsapp-link-item';
        
        const studentInfo = document.createElement('div');
        studentInfo.className = 'student-info';
        studentInfo.innerHTML = `<strong>${student.name}</strong><br>ID: ${student.id}<br>Phone: ${student.phone}`;
        
        const sendButton = document.createElement('a');
        sendButton.className = 'whatsapp-send-btn';
        sendButton.innerHTML = '<i class="fab fa-whatsapp"></i> Send ID';
        sendButton.href = createWhatsAppLink(student);
        sendButton.target = '_blank';
        
        listItem.appendChild(studentInfo);
        listItem.appendChild(sendButton);
        listContainer.appendChild(listItem);
    });
    
    // Add elements to modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(listContainer);
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .whatsapp-links-modal {
            display: flex;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            justify-content: center;
            align-items: center;
        }
        
        .whatsapp-modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        
        .whatsapp-modal-close {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
        }
        
        .whatsapp-links-list {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .whatsapp-link-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-radius: 5px;
            background-color: #f0f0f0;
        }
        
        .whatsapp-send-btn {
            background-color: #25D366;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .whatsapp-send-btn i {
            font-size: 18px;
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

// Function to show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'vote-notification';
    notification.innerHTML = `<i class="fa fa-check-circle"></i> ${message}`;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
            document.body.removeChild(notification);
            }, 500);
        }, 3000);
    
    // Add notification styles
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .vote-notification {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #25D366;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
        }
        
        .vote-notification i {
            margin-right: 10px;
        }
        
        .vote-notification.fade-out {
            animation: fadeOut 0.5s forwards;
        }
        
        @keyframes fadeOut {
            100% {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(notificationStyle);
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

const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .vote-notification {
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: #25D366;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
    }
    
    .vote-notification i {
        margin-right: 10px;
    }
    
    .vote-notification.fade-out {
        animation: fadeOut 0.5s forwards;
    }
    
    @keyframes fadeOut {
        100% {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(notificationStyle); 