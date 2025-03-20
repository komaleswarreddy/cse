// Student data with predefined 4-digit codes
const students = [
    // Each student has a unique code, name
    { id: 1001, name: "NAKSHATRA" },
    { id: 1002, name: "S.V. POOJITHA" },
    { id: 1003, name: "CHUSMALATHA" },
    { id: 1004, name: "HARSHITHA" },
    { id: 1005, name: "SHABHANA" },
    { id: 1006, name: "PARDHU" },
    { id: 1007, name: "SRINU" },
    { id: 1008, name: "BALU" },
    { id: 1009, name: "MOULI" },
    { id: 1010, name: "NAVANEETH" },
    { id: 1011, name: "ROHITH" },
    { id: 1012, name: "DIWAKAR" },
    { id: 1013, name: "MAHESH" },
    { id: 1014, name: "GANESH" },
    { id: 1015, name: "YUVARAJ" },
    { id: 1016, name: "UMA MANIKANTA" },
    { id: 1017, name: "SYAM" },
    { id: 1018, name: "PRASHANTH" },
    { id: 1019, name: "BASHA" },
    { id: 1020, name: "DHARANESHWAR" },
    { id: 1021, name: "RAKESH" },
    { id: 1022, name: "ANUSHA" },
    { id: 1023, name: "CH. VAISHNAVI" },
    { id: 1024, name: "VIJAYALAKSHMI" },
    { id: 1025, name: "ANJALI" },
    { id: 1026, name: "CHARISHMA" },
    { id: 1027, name: "KOMAL" },
    { id: 1028, name: "SRIBABU" },
    { id: 1029, name: "LAKSHMAN" },
    { id: 1030, name: "VIJJI" },
    { id: 1031, name: "R. VYSHNAVI" },
    { id: 1032, name: "SUSI" },
    { id: 1033, name: "N. LIKHITHA (NAINI)" },
    { id: 1034, name: "NAGA LIKHITHA" },
    { id: 1035, name: "SAMEERAJA" },
    { id: 1036, name: "SRAVANI" },
    { id: 1037, name: "JAHNAVI" },
    { id: 1038, name: "SRI MANIKANTA" },
    { id: 1039, name: "HEMANTH" },
    { id: 1040, name: "BINDHU SRI" },
    { id: 1041, name: "ISHYA" },
    { id: 1042, name: "MANASA" },
    { id: 1043, name: "SOWMYA SRI" },
    { id: 1044, name: "SHANMUKH" },
    { id: 1045, name: "RAM SAI ROHITH" },
    { id: 1046, name: "TEJA SRI" },
    { id: 1047, name: "SUSMITHA" },
    { id: 1048, name: "VIJAYA SRI" },
    { id: 1049, name: "SNEHALATHA" },
    { id: 1050, name: "LAHARI" },
    { id: 1051, name: "INDHU JOY" },
    { id: 1052, name: "RENU SRI" },
    { id: 1053, name: "SRAVAN" },
    { id: 1054, name: "MOTHILAL" },
    { id: 1055, name: "KOWSHIK" },
    { id: 1056, name: "GOPI" },
    { id: 1057, name: "MALLIKARJUN" },
    { id: 1058, name: "V. POOJITHA" },
    { id: 1059, name: "JOSHNA" },
    { id: 1060, name: "VENNELA SRI" },
];

// Admin code
const ADMIN_CODE = 9999;

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
        nominees: ["ROHITH", "KOMAL", "MOULI", "YUVARAJ", "SYAM", "PARDHU"]
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
        nominees: ["SYAM", "SRIBABU", "RAKESH", "DHARANESHWAR", "UMA MANIKANTA", "KOMAL", "YUVARAJ", "MOULI", "SHANMUKH", "SRI MANIKANTA", "HEMANTH", "MAHESH"]
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
        nominees: ["YUVARAJ", "PARDHU", "MOULI", "SYAM", "RAKESH", "KOMAL", "MALLIKARJUN", "MAHESH"]
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