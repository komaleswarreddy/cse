// Script to send password to Syam
// This script checks if Syam's student ID is in the system and handles password generation

// Find Syam in student data
const syamStudent = students.find(student => student.name === "SYAM" || student.name.includes("SYAM"));

if (syamStudent) {
    // Store Syam's ID for potential password reset
    localStorage.setItem('syamId', syamStudent.id);
    console.log('Syam ID stored for potential password operations');
} 