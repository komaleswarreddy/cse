# Sending Password to Mothilal

## Overview

This file explains how the system automatically sends a password to Bhukya Mothilal Naik's email (n211026@rguktn.ac.in).

## How It Works

1. The `sendPasswordToMothilal.js` script automatically runs when the page loads
2. It finds Mothilal in the student database (ID: 1054)
3. Generates a secure random 8-character password for him
4. Simulates sending this password to his email address: n211026@rguktn.ac.in
5. Shows a notification with the password details on the page
6. Stores the password in localStorage for reference

## Technical Implementation

In a real-world implementation, this would connect to an email service API (like SendGrid, Mailgun, etc.) to actually send the email. The current implementation:

1. Logs the email details to the browser console
2. Displays a notification on screen with the password
3. Stores the password in localStorage (for demonstration)

## Viewing the Password

You can view the password that was generated for Mothilal in several ways:

1. Looking at the notification that appears in the lower right corner of the screen
2. Opening the browser console (F12 or right-click > Inspect > Console) to see the email details
3. Running `localStorage.getItem('mothilalPassword')` in the browser console

## Security Considerations

In a production environment:
- The password would be sent securely via email, not displayed on screen
- An actual email service API would be used
- The password would not be stored in localStorage
- Generate a one-time temporary password that must be changed on first login 