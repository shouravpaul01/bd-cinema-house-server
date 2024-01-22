const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')

router.post('/',async(req,res)=>{
    try {
        const result = new userModel(req.body)
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully added' })
        }
    } catch (err) {

        if (err.email === 'MongoServerError' && err.code === 11000) {
            res.json({ code: 204, validationErrors: [{ field: 'email', message: 'Already exist the email.' }] })
        } else if (err.name === 'ValidationError') {
            // Handle validation error
            const validationErrors = Object.keys(err.errors).map(field => ({
                field,
                message: err.errors[field].message,
            }));
            res.json({ code: 204, validationErrors: validationErrors })
        } else {
            // Handle other errors
            console.error('err', err.message);
        }
    }

})
//Get specific user where user role is admin
router.get('/admin-user', async (req, res) => {
   
    try {
        const data = await userModel.findOne({ email: req.query.email, role: "admin" })
       
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
//Get specific user where user role is claint
router.get('/claint-user', async (req, res) => {
   
    try {
        const data = await userModel.findOne({ email: req.query.email, role: "claint" })
       
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
module.exports = router