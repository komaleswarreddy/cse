// Script to completely reset and reinitialize the database
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Database reset script starting...');
console.log('Using MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define models
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    phone: String
});

// Drop the existing model if it exists
mongoose.deleteModel(/.*/, function(err) {
    if (err) console.error('Error dropping models:', err);
});

// Create a fresh model
const User = mongoose.model('User', userSchema);

// Student data
const students = [
    { id: 103456, name: "NAKSHATRA", phone: "8008647735" },
    { id: 234567, name: "S.V. POOJITHA", phone: "9347871250" },
    { id: 345678, name: "CHUSMALATHA", phone: "9491971357" },
    { id: 456789, name: "HARSHITHA", phone: "9704681883" },
    { id: 567890, name: "SHABHANA", phone: "6300468313" },
    { id: 678901, name: "PARDHU", phone: "9121828939" },
    { id: 789012, name: "SRINU", phone: "8185037844" },
    { id: 890123, name: "BALU", phone: "8919421749" },
    { id: 901234, name: "MOULI", phone: "8688206784" },
    { id: 112233, name: "NAVANEETH", phone: "6309135641" },
    { id: 223344, name: "ROHITH", phone: "9391458807" },
    { id: 334455, name: "DIWAKAR", phone: "9381018470" },
    { id: 445566, name: "MAHESH", phone: "8008791096" },
    { id: 556677, name: "GANESH", phone: "9666506739" },
    { id: 667788, name: "YUVARAJ", phone: "6281523252" },
    { id: 778899, name: "UMA MANIKANTA", phone: "9581164547" },
    { id: 889900, name: "SYAM", phone: "8179249607" },
    { id: 998877, name: "PRASHANTH", phone: "6300747673" },
    { id: 887766, name: "BASHA", phone: "7893289938" },
    { id: 776655, name: "DHARANESHWAR", phone: "8790756930" },
    { id: 665544, name: "RAKESH", phone: "9959368028" },
    { id: 554433, name: "ANUSHA", phone: "9603535897" },
    { id: 443322, name: "CH. VAISHNAVI", phone: "8688099154" },
    { id: 332211, name: "Selva", phone: "6302445382" },
    { id: 221100, name: "ANJALI", phone: "9391822981" },
    { id: 123789, name: "CHARISHMA", phone: "7032717457" },
    { id: 234890, name: "KOMAL", phone: "7997696708" },
    { id: 345901, name: "SRIBABU", phone: "6303738847" },
    { id: 456012, name: "LAKSHMAN", phone: "7032634865" },
    { id: 567123, name: "VIJJI", phone: "9347383956" },
    { id: 678234, name: "R. VYSHNAVI", phone: "7794095499" },
    { id: 789345, name: "SUSI", phone: "6304668409" },
    { id: 890456, name: "N. LIKHITHA (NAINI)", phone: "8688157703" },
    { id: 901567, name: "NAGA LIKHITHA", phone: "9182683348" },
    { id: 112678, name: "SAMEERAJA", phone: "9390851343" },
    { id: 223789, name: "SRAVANI", phone: "8247321688" },
    { id: 334890, name: "JAHNAVI", phone: "9676196248" },
    { id: 445901, name: "SRI MANIKANTA", phone: "7095658244" },
    { id: 556012, name: "HEMANTH", phone: "8247828369" },
    { id: 667123, name: "BINDHU SRI", phone: "8179672477" },
    { id: 778234, name: "ISHYA", phone: "8688471202" },
    { id: 889345, name: "MANASA", phone: "6301485255" },
    { id: 900456, name: "SOWMYA SRI", phone: "7893404682" },
    { id: 111567, name: "SHANMUKH", phone: "6304224133" },
    { id: 222678, name: "RAM SAI ROHITH", phone: "9491799765" },
    { id: 333789, name: "TEJA SRI", phone: "8309772120" },
    { id: 444890, name: "SUSMITHA", phone: "8688408336" },
    { id: 555901, name: "VIJAYA SRI", phone: "9346840089" },
    { id: 666012, name: "SNEHALATHA", phone: "9014796117" },
    { id: 777123, name: "LAHARI", phone: "8501916657" },
    { id: 888234, name: "INDHU JOY", phone: "8523026594" },
    { id: 999345, name: "RENU SRI", phone: "9398939088" },
    { id: 123567, name: "SRAVAN", phone: "6301934205" },
    { id: 234678, name: "MOTHILAL", phone: "9392680180" },
    { id: 345789, name: "KOWSHIK", phone: "7416281355" },
    { id: 456890, name: "GOPI", phone: "7989404415" },
    { id: 567901, name: "MALLIKARJUN", phone: "8106892584" },
    { id: 678012, name: "V. POOJITHA", phone: "7993813258" },
    { id: 789123, name: "JOSHNA", phone: "8074341849" },
    { id: 890234, name: "VENNELA SRI", phone: "8919786458" },
    { id: 999999, name: "ADMIN", phone: "" }
];

// Clear and repopulate the database
async function resetDatabase() {
    try {
        // Delete all collections
        console.log('Dropping all collections...');
        const collections = Object.keys(mongoose.connection.collections);
        for (const collectionName of collections) {
            try {
                const collection = mongoose.connection.collections[collectionName];
                await collection.drop();
                console.log(`Collection ${collectionName} dropped`);
            } catch (error) {
                // This error happens when trying to drop a collection that doesn't exist
                if (error.code === 26) {
                    console.log(`Collection ${collectionName} doesn't exist, skipping`);
                } else {
                    console.error(`Error dropping collection ${collectionName}`, error);
                }
            }
        }
        
        // Insert students one by one to avoid bulk errors
        console.log('Inserting students one by one...');
        let successCount = 0;
        
        for (const student of students) {
            try {
                await User.create(student);
                successCount++;
                if (successCount % 10 === 0) {
                    console.log(`Inserted ${successCount} students so far...`);
                }
            } catch (error) {
                console.error(`Error inserting student ${student.id} (${student.name}):`, error.message);
            }
        }
        
        // Verify data
        const count = await User.countDocuments();
        console.log(`${count} students inserted into the database`);
        
        // Check for specific test users
        const testUsers = [
            await User.findOne({ id: 103456 }),  // NAKSHATRA
            await User.findOne({ id: 234567 }),  // S.V. POOJITHA
            await User.findOne({ id: 999999 })   // ADMIN
        ];
        
        console.log('Test users:');
        testUsers.forEach((user, index) => {
            const expected = ["NAKSHATRA", "S.V. POOJITHA", "ADMIN"][index];
            if (user) {
                console.log(`- ID ${user.id}: ${user.name} - ${user.name === expected ? 'CORRECT' : 'WRONG NAME!'}`);
            } else {
                console.log(`- ${expected}: Not found`);
            }
        });
        
        console.log('Database reset complete!');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the reset
resetDatabase(); 