# Password Reset Functionality

This system includes a password reset mechanism that allows students to reset their passwords if they forget them. It has been specifically configured to support Bhukya Mothilal Naik's account with email address `n211026@rguktn.ac.in`.

## How It Works

1. On the login page, there's a "Forgot Password?" link at the bottom.
2. When clicked, a modal dialog appears asking for:
   - Student ID (4-digit code)
   - Email address

3. The system verifies that:
   - The Student ID exists in the system
   - For Mothilal (ID: 1054), the email must match `n211026@rguktn.ac.in`

4. When verified, the system:
   - Generates a secure random 8-character password
   - Displays the password in the success message
   - Logs information to the console about the "email" that would be sent
   
## Email Sending (Simulated)

In a production environment, you would need to configure a real email service API. The current implementation:

- Simulates sending an email by logging the information to the console
- Shows the generated password directly in the UI for demonstration purposes

## Integrating a Real Email Service

To integrate a real email service (like SendGrid, Mailgun, etc.):

1. Sign up for the email service and get your API keys
2. Replace the `sendPasswordEmail` function in `passwordReset.js` with the actual API call
3. Remove the password display from the success message (for security)

## Security Notes

- In a production environment, passwords should never be displayed on screen
- Email services should use secure connections (HTTPS)
- Consider implementing a more secure password reset flow using time-limited tokens
- Consider adding rate limiting to prevent brute force attempts

## Student Data

The system is specifically configured for Mothilal (ID: 1054) to reset his password using email `n211026@rguktn.ac.in`. 