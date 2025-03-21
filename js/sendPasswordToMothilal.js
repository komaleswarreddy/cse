// Script to send password to Mothilal
// This script checks if Mothilal's student ID is in the system and handles password generation

// Find Mothilal in student data
const mothilalStudent = students.find(student => student.name === "MOTHILAL" || student.name.includes("MOTHILAL"));

if (mothilalStudent) {
    // Store Mothilal's ID for potential password reset
    localStorage.setItem('mothilalId', mothilalStudent.id);
    console.log('Mothilal ID stored for potential password operations');
} 