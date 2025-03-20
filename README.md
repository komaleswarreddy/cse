# CSE6 Poll System

A professional, fully responsive, dark-themed login and polling system for CSE6 students. This system allows students to log in using a unique 4-digit code and vote for their classmates in various fun categories.

## Features

- **Secure Login**: 4-digit code authentication (predefined for each student)
- **Admin Portal**: Special access with code 9999 to view all voting results
- **Voting System**: Students can vote for nominees in 15 different categories
- **Real-Time Updates**: Vote counts update instantly
- **Dark Theme UI**: Modern and sleek interface with glassmorphism design
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop screens
- **Animated UI**: Smooth transitions, hover effects, and feedback animations
- **Auto-Logout**: Security feature that logs out inactive users after 10 minutes

## How to Use

### For Students

1. Enter your assigned 4-digit code in the login screen (codes start from 1001)
2. Browse through the different categories on your dashboard
3. Select one nominee for each category by clicking on their name
4. Your votes are automatically saved and can be changed at any time
5. Log out when finished

### For Admin

1. Enter code `9999` to access the admin dashboard
2. View real-time voting results for all categories
3. See voting statistics including total votes and most popular categories
4. Search for specific categories or nominees using the search bar
5. Log out when finished

## Technical Details

This project is built with:

- **HTML5**: Semantic markup for structure
- **CSS3**: Advanced styling with flexbox, grid, variables, and animations
- **JavaScript (ES6+)**: Client-side functionality for login, voting, and results
- **Local Storage**: Secure storage of votes and user session

## Categories

The system includes voting for the following categories:

1. MISS QUEEN OF CSE6
2. HANDSOME OF CSE6
3. FUNNY OF CSE6
4. CRAZY BOY
5. SINGER (MALE)
6. SINGER (FEMALE)
7. STYLISH OF CSE6
8. DANCER (MALE)
9. DANCER (FEMALE)
10. FASHIONABLE OF CSE6
11. ACTOR OF CSE6
12. ACTRESS OF CSE6
13. MR. CODER OF CSE6
14. MISS CODER OF CSE6
15. TOPPER OF CSE6

## Security Features

- Each student has a unique login code
- One vote per student per category
- Admin-only access to results
- Auto-logout for idle sessions

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Login with a student code (1001-1060) or admin code (9999)

No server setup is required as the application runs entirely in the browser using local storage. 