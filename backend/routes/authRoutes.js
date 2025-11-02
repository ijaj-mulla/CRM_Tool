const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);
module.exports.oauth2Client = oauth2Client;
// Generate authentication URL
router.get('/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
    ];
    
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
    
    res.redirect(url);
});

// Google OAuth callback handler
router.get('/google/callback', async (req, res) => {
    const code = req.query.code;
    
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Store tokens in session or database (simplified for demonstration)
        // In a real application, you should store these securely
        
        // Redirect back to the emails page with success status
        const frontendEmailsUrl = process.env.FRONTEND_EMAILS_URL || 'http://localhost:8080/activities/emails';
        res.redirect(`${frontendEmailsUrl}?auth=success`);
    } catch (error) {
        console.error('Error during Google OAuth callback:', error);
        const frontendEmailsUrl = process.env.FRONTEND_EMAILS_URL || 'http://localhost:8080/activities/emails';
        res.redirect(`${frontendEmailsUrl}?auth=error`);
    }
});

module.exports = router;