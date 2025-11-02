const quoteSchema = require("../models/Quote")
const { ensureOrderForQuoteStatus, updateOpportunityForQuoteStatus } = require('../automation/watchers');
const Account = require("../models/Account");
const Contact = require("../models/Contact");
const Product = require("../models/Product");

const createQuote = async(req,res) =>
    {
        try
        {
            let bodyData = req.body;
            
            // Parse JSON strings from FormData if present
            if (bodyData.financials && typeof bodyData.financials === 'string') {
                bodyData.financials = JSON.parse(bodyData.financials);
            }

            // Normalize fields
            if (bodyData.amount !== undefined && bodyData.amount !== "") {
                bodyData.amount = Number(bodyData.amount);
            }
            if (bodyData.date) bodyData.date = new Date(bodyData.date);
            if (bodyData.validTo) bodyData.validTo = new Date(bodyData.validTo);
            
            let quote = new quoteSchema(bodyData);
            
            // Handle file upload if present
            if (req.file) {
                quote.uploaded_pdf = req.file.filename;
            }
            
            let result = await quote.save();
            // Direct automation on create if status already indicates order
            if (String(result?.status || '').toLowerCase() === 'order') {
                try { await ensureOrderForQuoteStatus(result.toObject ? result.toObject() : result); } catch (_) {}
            }
            // Direct automation on create if status indicates no order
            if (String(result?.status || '').toLowerCase() === 'no order') {
                try { await updateOpportunityForQuoteStatus(result.toObject ? result.toObject() : result); } catch (_) {}
            }

            if(result)
                res.status(201).json(result);
            else
                res.status(400).json("Cannot create Quote");
        }
        catch(err)
        {
            console.error("Error creating quote:", err);
            res.status(500).json("Server Error: " + err.message);
        }
    }

const getQuotes = async(req,res) =>
    {
            
            try
            {
                let data =await quoteSchema.find();
    
                if(data)
                    res.status(200).json(data);
                else
                    res.status(400).json("No Quote found");
            }
            catch(err)
            {
                console.log("Server Error");
            }
        }

const updateQuote = async(req,res) =>
    {
        try
        {
            let updateData = req.body;
            
            // Parse JSON strings from FormData if present
            if (updateData.financials && typeof updateData.financials === 'string') {
                updateData.financials = JSON.parse(updateData.financials);
            }
            
            // Handle file upload if present
            if (req.file) {
                updateData.uploaded_pdf = req.file.filename;
            }

            // Normalize fields
            if (updateData.amount !== undefined && updateData.amount !== "") {
                updateData.amount = Number(updateData.amount);
            }
            if (updateData.date) updateData.date = new Date(updateData.date);
            if (updateData.validTo) updateData.validTo = new Date(updateData.validTo);
            
            let prev = await quoteSchema.findById(req.params.id).lean();
            let result = await quoteSchema.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if(result)
                res.status(200).json(result);
            else
                res.status(400).json("Cannot update Quote");

            // Direct automation trigger when status becomes 'Order' or 'No Order'
            if (result) {
                const newStatus = String(result.status || '').toLowerCase();
                const prevStatus = String(prev?.status || '').toLowerCase();
                if (newStatus === 'order' && prevStatus !== 'order') {
                    try { await ensureOrderForQuoteStatus(result.toObject ? result.toObject() : result); } catch (_) {}
                }
                if (newStatus === 'no order' && prevStatus !== 'no order') {
                    try { await updateOpportunityForQuoteStatus(result.toObject ? result.toObject() : result); } catch (_) {}
                }
            }
        }
        catch(err)
        {
            console.error("Error updating quote:", err);
            res.status(500).json("Server Error: " + err.message);
        }
    }

const getQuoteById = async(req,res) =>
    {
        try
        {
            let data = await quoteSchema.findById(req.params.id);

            if(data)
                res.status(200).json(data);
            else
                res.status(400).json("Quote not found");
        }
        catch(err)
        {
            res.status(500).json("Server Error");
        }
    }

const deleteQuote = async(req,res) =>
    {
        try
        {
            let result = await quoteSchema.findByIdAndDelete(req.params.id);

            if(result)
                res.status(200).json("Quote deleted successfully");
            else
                res.status(400).json("Cannot delete Quote");
        }
        catch(err)
        {
            res.status(500).json("Server Error");
        }
    }

// Search accounts by name (q)
const searchAccount = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        const regex = new RegExp(q, 'i');
        const results = await Account.find({ name: regex }).limit(10).select('name city state country');
        return res.json(results.map(a => ({ name: a.name, city: a.city, state: a.state, country: a.country })));
    } catch (err) {
        console.error(err);
        return res.status(500).json('Server Error');
    }
};

// Search contacts by mainContact; optionally filter by account name via ?account=...
const searchContact = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const accountName = (req.query.account || '').trim();
        if (!q) return res.json([]);
        const regex = new RegExp(q, 'i');
        const filter = { mainContact: regex };
        if (accountName) filter.accountName = accountName;
        const results = await Contact.find(filter).limit(10).select('mainContact email mobile accountName');
        return res.json(results.map(c => ({ name: c.mainContact, email: c.email, mobile: c.mobile, accountName: c.accountName })));
    } catch (err) {
        console.error(err);
        return res.status(500).json('Server Error');
    }
};

// Search products by name
const searchProduct = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        const regex = new RegExp(q, 'i');
        const results = await Product.find({ name: regex }).limit(10).select('name id category');
        return res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json('Server Error');
    }
};

module.exports = {createQuote, getQuotes, updateQuote, getQuoteById, deleteQuote, searchAccount, searchContact, searchProduct};