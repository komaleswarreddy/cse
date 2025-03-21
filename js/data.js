// Student data with random 6-digit IDs
const students = [
    // Each student has a unique 6-digit code, name and phone number
    { id: 123456, name: "NAKSHATRA", phone: "" },
    { id: 234567, name: "S.V. POOJITHA", phone: "" },
    { id: 345678, name: "CHUSMALATHA", phone: "" },
    { id: 456789, name: "HARSHITHA", phone: "" },
    { id: 567890, name: "SHABHANA", phone: "" },
    { id: 678901, name: "PARDHU", phone: "9121828939" },
    { id: 789012, name: "SRINU", phone: "" },
    { id: 890123, name: "BALU", phone: "" },
    { id: 901234, name: "MOULI", phone: "" },
    { id: 112233, name: "NAVANEETH", phone: "" },
    { id: 223344, name: "ROHITH", phone: "" },
    { id: 334455, name: "DIWAKAR", phone: "" },
    { id: 445566, name: "MAHESH", phone: "" },
    { id: 556677, name: "GANESH", phone: "" },
    { id: 667788, name: "YUVARAJ", phone: "6281523252" },
    { id: 778899, name: "UMA MANIKANTA", phone: "" },
    { id: 889900, name: "SYAM", phone: "8179249607" },
    { id: 998877, name: "PRASHANTH", phone: "" },
    { id: 887766, name: "BASHA", phone: "" },
    { id: 776655, name: "DHARANESHWAR", phone: "" },
    { id: 665544, name: "RAKESH", phone: "" },
    { id: 554433, name: "ANUSHA", phone: "" },
    { id: 443322, name: "CH. VAISHNAVI", phone: "" },
    { id: 332211, name: "VIJAYALAKSHMI", phone: "" },
    { id: 221100, name: "ANJALI", phone: "" },
    { id: 123789, name: "CHARISHMA", phone: "" },
    { id: 234890, name: "KOMAL", phone: "7997696708" },
    { id: 345901, name: "SRIBABU", phone: "" },
    { id: 456012, name: "LAKSHMAN", phone: "" },
    { id: 567123, name: "VIJJI", phone: "" },
    { id: 678234, name: "R. VYSHNAVI", phone: "" },
    { id: 789345, name: "SUSI", phone: "" },
    { id: 890456, name: "N. LIKHITHA (NAINI)", phone: "" },
    { id: 901567, name: "NAGA LIKHITHA", phone: "" },
    { id: 112678, name: "SAMEERAJA", phone: "" },
    { id: 223789, name: "SRAVANI", phone: "" },
    { id: 334890, name: "JAHNAVI", phone: "" },
    { id: 445901, name: "SRI MANIKANTA", phone: "" },
    { id: 556012, name: "HEMANTH", phone: "" },
    { id: 667123, name: "BINDHU SRI", phone: "" },
    { id: 778234, name: "ISHYA", phone: "" },
    { id: 889345, name: "MANASA", phone: "" },
    { id: 900456, name: "SOWMYA SRI", phone: "" },
    { id: 111567, name: "SHANMUKH", phone: "" },
    { id: 222678, name: "RAM SAI ROHITH", phone: "" },
    { id: 333789, name: "TEJA SRI", phone: "" },
    { id: 444890, name: "SUSMITHA", phone: "" },
    { id: 555901, name: "VIJAYA SRI", phone: "" },
    { id: 666012, name: "SNEHALATHA", phone: "" },
    { id: 777123, name: "LAHARI", phone: "" },
    { id: 888234, name: "INDHU JOY", phone: "" },
    { id: 999345, name: "RENU SRI", phone: "" },
    { id: 123567, name: "SRAVAN", phone: "" },
    { id: 234678, name: "MOTHILAL", phone: "" },
    { id: 345789, name: "KOWSHIK", phone: "" },
    { id: 456890, name: "GOPI", phone: "" },
    { id: 567901, name: "MALLIKARJUN", phone: "" },
    { id: 678012, name: "V. POOJITHA", phone: "" },
    { id: 789123, name: "JOSHNA", phone: "" },
    { id: 890234, name: "VENNELA SRI", phone: "" }
];

// Admin code
const ADMIN_CODE = 999999;

// Categories with nominees
const categories = [
    {
        id: 1,
        name: "MISS QUEEN OF CSE6",
        icon: "👑",
        nominees: ["NAKSHATRA", "S.V. POOJITHA", "CHUSMALATHA", "HARSHITHA", "SHABHANA"]
    },
    {
        id: 2,
        name: "HANDSOME OF CSE6",
        icon: "😎",
        nominees: ["PARDHU", "SRINU", "BALU", "MOULI", "NAVANEETH", "ROHITH"]
    },
    {
        id: 3,
        name: "FUNNY OF CSE6",
        icon: "😂",
        nominees: ["DIWAKAR", "MOULI", "MAHESH", "GANESH", "YUVARAJ"]
    },
    {
        id: 4,
        name: "CRAZY BOY",
        icon: "🎭",
        nominees: ["YUVARAJ", "UMA MANIKANTA", "SYAM", "MOULI", "PRASHANTH"]
    },
    {
        id: 5,
        name: "SINGER (MALE)",
        icon: "🎼",
        nominees: ["BASHA", "DHARANESHWAR", "RAKESH", "UMA MANIKANTA", "SYAM"]
    },
    {
        id: 6,
        name: "SINGER (FEMALE)",
        icon: "🎤",
        nominees: ["ANUSHA", "CH. VAISHNAVI", "VIJAYALAKSHMI", "ANJALI", "CHARISHMA"]
    },
    {
        id: 7,
        name: "STYLISH OF CSE6",
        icon: "🤩",
        nominees: ["ROHITH",  "MOULI", "YUVARAJ", "SYAM", "PARDHU"]
    },
    {
        id: 8,
        name: "DANCER (MALE)",
        icon: "💃",
        nominees: ["ROHITH", "PARDHU", "UMA MANIKANTA", "SYAM", "DIWAKAR", "SRIBABU", "MOULI", "LAKSHMAN"]
    },
    {
        id: 9,
        name: "DANCER (FEMALE)",
        icon: "🕺",
        nominees: ["VIJJI", "R. VYSHNAVI", "CHUSMALATHA", "SUSI", "ANJALI"]
    },
    {
        id: 10,
        name: "FASHIONABLE OF CSE6",
        icon: "👗",
        nominees: ["SUSI", "HARSHITHA", "S.V. POOJITHA", "N. LIKHITHA (NAINI)", "NAGA LIKHITHA", "VIJJI", "SAMEERAJA"]
    },
    {
        id: 11,
        name: "ACTOR OF CSE6",
        icon: "🎭",
        nominees: ["UMA MANIKANTA", "DIWAKAR", "SYAM", "YUVARAJ", "MOULI", "GANESH", "DHARANESHWAR", "BASHA"]
    },
    {
        id: 12,
        name: "ACTRESS OF CSE6",
        icon: "🎭",
        nominees: ["VIJJI", "SRAVANI", "JAHNAVI", "ANJALI", "SHABHANA", "CHUSMALATHA"]
    },
    {
        id: 13,
        name: "MR. CODER OF CSE6",
        icon: "👨‍💻",
        nominees: ["SYAM", "SRIBABU", "RAKESH", "DHARANESHWAR", "UMA MANIKANTA",  "YUVARAJ", "MOULI", "SHANMUKH", "SRI MANIKANTA", "HEMANTH", "MAHESH"]
    },
    {
        id: 14,
        name: "MISS CODER OF CSE6",
        icon: "👩‍💻",
        nominees: ["NAKSHATRA", "SRAVANI", "S.V. POOJITHA", "V. POOJITHA", "JAHNAVI", "BINDHU SRI", "ISHYA"]
    },
    {
        id: 15,
        name: "TOPPER OF CSE6",
        icon: "🏆",
        nominees: ["ISHYA", "MANASA", "NAGA LIKHITHA", "SOWMYA SRI", "SHANMUKH", "RAM SAI ROHITH", "HEMANTH", "PRASHANTH", "LAKSHMAN", "GANESH"]
    },
    {
        id: 16,
        name: "INTROVERT GIRL",
        icon: "🤫",
        nominees: ["TEJA SRI", "SUSMITHA", "VIJAYA SRI", "SNEHALATHA", "LAHARI", "VENNELA SRI"]
    },
    {
        id: 17,
        name: "SILENT GIRL",
        icon: "🤐",
        nominees: ["INDHU JOY", "MANASA", "RENU SRI", "BINDHU SRI", "CH. VAISHNAVI", "JOSHNA"]
    },
    {
        id: 18,
        name: "INTROVERT OF CSE6",
        icon: "😶",
        nominees: ["SRAVAN", "MOTHILAL", "KOWSHIK", "GOPI", "SHANMUKH"]
    },
    {
        id: 19,
        name: "PULIHORA KING OF CSE6",
        icon: "👨‍🍳",
        nominees: ["YUVARAJ",  "MOULI", "SYAM", "RAKESH",  "MALLIKARJUN", "MAHESH"]
    },
    {
        id: 20,
        name: "LIBRARIAN OF CSE6",
        icon: "📚",
        nominees: ["PARDHU", "DIWAKAR", "LAKSHMAN", "CH. VAISHNAVI", "V. POOJITHA", "JAHNAVI", "PRASHANTH"]
    },
    {
        id: 21,
        name: "CRAZY GIRL",
        icon: "🤪",
        nominees: ["SAMEERAJA", "VIJJI", "SUSI", "SHABHANA", "ANJALI"]
    }
]; 