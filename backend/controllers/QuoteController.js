const quoteSchema = require("../models/Quote")

const createQuote = async(req,res) =>
    {
        try
        {
            let quote = new quoteSchema(req.body);
            let result = await quote.save();

            if(result)
                res.status(201).json(result);
            else
                res.status(400).json("Cannot create Quote");
        }
        catch(err)
        {
            res.status(500).json("Server Error");
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

module.exports = {createQuote, getQuotes};