const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

router.post('/jwt-signin',async(req,res)=>{
    try {
        const findUser=await userModel.findOne({email:req.body.email})

        const token=jwt.sign({
            email:findUser.email
        },process.env.JWT_SECRET,{ expiresIn: '1h' })
        res.json({token:token ,user:findUser}) 
    } catch (err) {
        console.log(err.message);
    }

})

module.exports=router