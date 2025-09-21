const OpportunitySchema = require('../models/opportunity');


const createOpportunity =  async (req, res) =>
{

    try
    {
        const opportunity = new OpportunitySchema(req.body);
        let result = await opportunity.save();
                
        if(result)
            res.status(200).json(result);
        else
            res.status(400).json("Cannot Create Opportunity");
    }
    catch(err)
    {
        res.status(500).json("Server Error");
        console.log(err);
    
    }

}


const getOpportunity =  async (req, res) =>
    {
        
        try
        {
            let data =await OpportunitySchema.find();

            if(data)
                res.status(200).json(data);
            else
                res.status(400).json("No Opportunity found");
        }
        catch(err)
        {
            console.log("Server Error");
        }
    };

module.exports = {createOpportunity, getOpportunity};