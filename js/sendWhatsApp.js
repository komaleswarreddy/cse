// Function to send WhatsApp message with student ID
async function sendWhatsAppMessage(studentId) {
    // Find student by ID
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        console.error('Student not found with ID:', studentId);
        showNotification('Error: Student not found');
        return false;
    }
    
    if (!student.phone || student.phone.trim() === '') {
        console.error('Phone number not available for student:', student.name);
        showNotification(`Error: No phone number for ${student.name}`);
        return false;
    }

    try {
        // Create the message
        const message = `Hello ${student.name}, your CSE6 Poll System ID is: ${student.id}`;
        
        // Format phone number (remove spaces and ensure it starts with 91)
        let phoneNumber = student.phone.replace(/\s+/g, '').replace(/[-+]/g, '');
        
        // Validate phone number format
        if (!/^\d+$/.test(phoneNumber)) {
            console.error('Invalid phone number format:', student.phone);
            showNotification(`Error: Invalid phone number for ${student.name}`);
            return false;
        }
        
        // Add country code if missing (default to 91 for India)
        if (phoneNumber.length === 10) {
            phoneNumber = '91' + phoneNumber;
        } else if (!phoneNumber.startsWith('91')) {
            phoneNumber = '91' + phoneNumber;
        }
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        console.log('Opening WhatsApp with URL:', whatsappURL);
        
        // Open WhatsApp in a new window
        window.open(whatsappURL, '_blank');
        
        // Add a small delay to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message: ' + error.message);
        return false;
    }
}

// Function to create WhatsApp link
function createWhatsAppLink(student) {
    if (!student || !student.phone) {
        console.error('Invalid student or missing phone number');
        return '#';
    }
    
    try {
        // Format phone number (remove spaces and ensure it starts with 91)
        let phoneNumber = student.phone.replace(/\s+/g, '').replace(/[-+]/g, '');
        
        // Validate phone number format
        if (!/^\d+$/.test(phoneNumber)) {
            console.error('Invalid phone number format:', student.phone);
            return '#';
        }
        
        // Add country code if missing (default to 91 for India)
        if (phoneNumber.length === 10) {
            phoneNumber = '91' + phoneNumber;
        } else if (!phoneNumber.startsWith('91')) {
            phoneNumber = '91' + phoneNumber;
        }
        
        // Create the festive message
        const message = `🎉 Hilaria 2k25 – The DEBBA DEBBA Awards! 🏆🥳

Hey ${student.name} 👋,

Brace yourself for the most legendary and unforgettable event of the Sem – The DEBBA DEBBA Awards!🌟🎭

🔐 Your VIP Access Code: ${student.id}
🌐 Website: https://hilariawards.netlify.app/

Let's make this celebration epic! 🎊`;
        
        // Create WhatsApp URL
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    } catch (error) {
        console.error('Error creating WhatsApp link:', error);
        return '#';
    }
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
    console.log('addSendIdButton function called');
    
    // No longer adding the floating button at the bottom
    // Only use the inline button in the admin controls
    console.log('WhatsApp button functionality relies on inline button only now');
    return;
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
    
    // Add notification styles if not already added
    if (!document.getElementById('whatsapp-notification-style')) {
        const notificationStyle = document.createElement('style');
        notificationStyle.id = 'whatsapp-notification-style';
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
}

// Add the button when admin dashboard is shown
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired in sendWhatsApp.js');
    
    // Add event listener for the inline WhatsApp button
    const inlineButton = document.getElementById('inline-whatsapp-btn');
    if (inlineButton) {
        console.log('Found inline WhatsApp button, adding event listener');
        inlineButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Inline WhatsApp button clicked');
            sendAllStudentIds();
        });
    } else {
        console.log('Inline WhatsApp button not found, will check again after delay');
        setTimeout(() => {
            const delayedButton = document.getElementById('inline-whatsapp-btn');
            if (delayedButton) {
                console.log('Found inline WhatsApp button after delay, adding event listener');
                delayedButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Inline WhatsApp button clicked');
                    sendAllStudentIds();
                });
            }
        }, 1000);
    }

    // Keep these functions for possible future use, but don't actually add the floating button
    function isAdminDashboardVisible() {
        const adminDashboard = document.getElementById('admin-dashboard');
        return adminDashboard && 
              (adminDashboard.style.display === 'block' || 
               window.getComputedStyle(adminDashboard).display !== 'none');
    }
    
    function isCurrentUserAdmin() {
        return typeof currentUser !== 'undefined' && 
               currentUser && 
               currentUser.id === ADMIN_CODE;
    }
    
    // No longer need to add the floating button
    // All other observers and event listeners are removed
});

// Keep this CSS for the inline button, but removed animation for the floating button
const whatsAppButtonStyle = document.createElement('style');
whatsAppButtonStyle.textContent = `
    /* Styling for the inline WhatsApp button only */
    .whatsapp-btn {
        background-color: #25D366 !important;
        color: white !important;
        margin-right: 10px;
        display: flex;
        align-items: center;
    }
    
    .whatsapp-btn:hover {
        background-color: #128C7E !important;
    }
    
    .whatsapp-btn i {
        margin-right: 8px;
    }
`;
document.head.appendChild(whatsAppButtonStyle);

// Make the function globally accessible for troubleshooting but it no longer adds the floating button
window.forceAddWhatsAppButton = function() {
    console.log('WhatsApp button function called, but floating button is disabled');
    return "WhatsApp functionality is available through the inline button in admin controls only.";
};

// No longer adding the floating button on script load
console.log('sendWhatsApp.js loaded. WhatsApp functionality available through inline button only.'); 