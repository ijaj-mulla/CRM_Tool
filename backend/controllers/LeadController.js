
const leadSchema = require('../models/leads');

const createLead =  async (req, res) => 
    {
        try
        {
            const lead = new leadSchema(req.body);
            let result = await lead.save();
            
            if(result)
                res.status(201).json(result);
            else
                res.status(400).json("Cannot Create Lead");
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json("Server Error");

        }
    };

const getLead =  async (req, res) =>
    {
        
        try
        {
        let data =await leadSchema.find();

        if(data)
            res.status(200).json(data);
        else
            res.status(400).json("No lead found");
        }
        catch(err)
        {
            console.log("Server Error");
        }
    };

module.exports = {createLead, getLead};