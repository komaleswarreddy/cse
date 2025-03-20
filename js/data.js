// Student data with random 6-digit IDs
const students = [
    // Each student has a unique 6-digit code and name
    { id: 123456, name: "NAKSHATRA" },
    { id: 234567, name: "S.V. POOJITHA" },
    { id: 345678, name: "CHUSMALATHA" },
    { id: 456789, name: "HARSHITHA" },
    { id: 567890, name: "SHABHANA" },
    { id: 678901, name: "PARDHU" },
    { id: 789012, name: "SRINU" },
    { id: 890123, name: "BALU" },
    { id: 901234, name: "MOULI" },
    { id: 112233, name: "NAVANEETH" },
    { id: 223344, name: "ROHITH" },
    { id: 334455, name: "DIWAKAR" },
    { id: 445566, name: "MAHESH" },
    { id: 556677, name: "GANESH" },
    { id: 667788, name: "YUVARAJ" },
    { id: 778899, name: "UMA MANIKANTA" },
    { id: 889900, name: "SYAM" },
    { id: 998877, name: "PRASHANTH" },
    { id: 887766, name: "BASHA" },
    { id: 776655, name: "DHARANESHWAR" },
    { id: 665544, name: "RAKESH" },
    { id: 554433, name: "ANUSHA" },
    { id: 443322, name: "CH. VAISHNAVI" },
    { id: 332211, name: "VIJAYALAKSHMI" },
    { id: 221100, name: "ANJALI" },
    { id: 123789, name: "CHARISHMA" },
    { id: 234890, name: "KOMAL" },
    { id: 345901, name: "SRIBABU" },
    { id: 456012, name: "LAKSHMAN" },
    { id: 567123, name: "VIJJI" },
    { id: 678234, name: "R. VYSHNAVI" },
    { id: 789345, name: "SUSI" },
    { id: 890456, name: "N. LIKHITHA (NAINI)" },
    { id: 901567, name: "NAGA LIKHITHA" },
    { id: 112678, name: "SAMEERAJA" },
    { id: 223789, name: "SRAVANI" },
    { id: 334890, name: "JAHNAVI" },
    { id: 445901, name: "SRI MANIKANTA" },
    { id: 556012, name: "HEMANTH" },
    { id: 667123, name: "BINDHU SRI" },
    { id: 778234, name: "ISHYA" },
    { id: 889345, name: "MANASA" },
    { id: 900456, name: "SOWMYA SRI" },
    { id: 111567, name: "SHANMUKH" },
    { id: 222678, name: "RAM SAI ROHITH" },
    { id: 333789, name: "TEJA SRI" },
    { id: 444890, name: "SUSMITHA" },
    { id: 555901, name: "VIJAYA SRI" },
    { id: 666012, name: "SNEHALATHA" },
    { id: 777123, name: "LAHARI" },
    { id: 888234, name: "INDHU JOY" },
    { id: 999345, name: "RENU SRI" },
    { id: 123567, name: "SRAVAN" },
    { id: 234678, name: "MOTHILAL" },
    { id: 345789, name: "KOWSHIK" },
    { id: 456890, name: "GOPI" },
    { id: 567901, name: "MALLIKARJUN" },
    { id: 678012, name: "V. POOJITHA" },
    { id: 789123, name: "JOSHNA" },
    { id: 890234, name: "VENNELA SRI" },
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
        nominees: ["YUVARAJ", "PARDHU", "MOULI", "SYAM", "RAKESH",  "MALLIKARJUN", "MAHESH"]
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