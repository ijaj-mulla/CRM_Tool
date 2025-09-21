const Contact=require('../models/Contact');

const createContact=async(req,res)=>{
    try{
        const contact=new Contact(req.body);   
        let result=await contact.save();
        if(result){
            res.status(201).json(result);
        }else{
            res.status(500).json({message:"Failed to create contact"});
        }
    }
    catch(error){
        res.status(400).json({error:error.message});
    }   
};

const getContacts=async(req,res)=>{
    try{
        let contacts=await Contact.find();
        if(contacts){
            res.status(200).json(contacts);
        }
        else{
            res.status(404).json({message:"No contacts found"});
        }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

module.exports={createContact,getContacts};