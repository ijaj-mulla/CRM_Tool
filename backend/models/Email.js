const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true,
        unique: true // To prevent duplicate emails
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Email', emailSchema);