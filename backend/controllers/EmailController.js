const { google } = require('googleapis');
const Email = require('../models/Email');

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback' // Use backend port
);

// Configure token refresh handling
oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        // Store the new refresh token if provided (consider persisting in DB)
        process.env.REFRESH_TOKEN = tokens.refresh_token;
    }
});

// Gmail API setup
const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client
});

const EmailController = {
    // Fetch all emails from MongoDB
    getAllEmails: async (req, res) => {
        try {
            const emails = await Email.find()
                .sort({ date: -1 })
                .select('-__v');
            res.json(emails);
        } catch (error) {
            console.error('Error fetching emails:', error);
            res.status(500).json({ message: 'Error fetching emails' });
        }
    },

    // Sync emails from Gmail
    syncEmails: async (req, res) => {
        try {
            // Set credentials using refresh token
            oauth2Client.setCredentials({
                refresh_token: process.env.REFRESH_TOKEN
            });

            // Verify authentication
            try {
                await oauth2Client.getAccessToken();
            } catch (authError) {
                console.error('Authentication failed:', authError);
                return res.status(401).json({ 
                    message: 'Gmail API authentication failed',
                    error: authError.message
                });
            }

            // Fetch latest 10 emails
            const response = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 10
            });

            const messages = response.data.messages || [];
            const newEmails = [];

            // Process each email
            for (const message of messages) {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'Subject', 'Date']
                });

                const headers = email.data.payload.headers;
                const from = headers.find(h => h.name === 'From')?.value || '';
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const date = headers.find(h => h.name === 'Date')?.value || '';
                const snippet = email.data.snippet || '';

                // Check if email already exists
                const exists = await Email.findOne({ messageId: message.id });
                if (!exists) {
                    const newEmail = await Email.create({
                        messageId: message.id,
                        from,
                        subject,
                        date,
                        snippet
                    });
                    newEmails.push(newEmail);
                }
            }

            res.json({
                message: 'Emails synced successfully',
                newEmailsCount: newEmails.length
            });
        } catch (error) {
            console.error('Error syncing emails:', error);
            res.status(500).json({ message: 'Error syncing emails' });
        }
    }
};

module.exports = EmailController;