const Account=require('../models/Account');

const createAccount=async(req,res)=>{
    try{
        const account=new Account(req.body);   
        let result=await account.save();
        if(result){
            res.status(201).json(result);
        }else{
            res.status(500).json({message:"Failed to create account"});
        }
    }
    catch(error){
        res.status(400).json({error:error.message});
    }   
};

const getAccounts=async(req,res)=>{
    try{
        let accounts=await Account.find();
        if(accounts){
            res.status(200).json(accounts);
        }
        else{
            res.status(404).json({message:"No accounts found"});
        }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

module.exports={createAccount,getAccounts};