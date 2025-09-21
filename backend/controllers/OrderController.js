const orderSchema = require('../models/SalesOrder');

const createOrders= async(req,res)=>
{
    try
    {
        let order = new orderSchema(req.body);
        let result = await order.save();

        if(result)
            res.status(201).json(result);
        else
            res.status(400).json("Cannot create Order");
    }   
    catch(err) 
    {
        console.log(err); 
        res.status(500).json('Server Error');
    }
}

const getOrders =  async(req,res)=>
{
    try
    {
        let data =await orderSchema.find();
    
        if(data)
            res.status(200).json(data);
        else
            res.status(400).json("No Quote found");
    }
    catch(err)
    {
        console.log(err);
        console.log("Server Error");
    }

}

module.exports = {createOrders, getOrders};