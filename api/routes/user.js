const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')

router.post('/', async (req, res) => {
    try {
        const result = new userModel(req.body)
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully Register.' })
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
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search
    
    try {
        const searchValue = {}
        if (search !== 'null') {
            searchValue.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
    
        const totalCount = await userModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await userModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
//user status updated by ID
router.patch('/update-role', async (req, res) => {

    try {
        const result = await userModel.findByIdAndUpdate(req.query._id, { role: req.query.role },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})

// User deleted by specific id
router.delete('/:_id', async (req, res) => {

    try {
        await userModel.deleteOne({ _id: req.params._id })
        res.status(200).json({ code: 200, message: "Successfully Deleted" })
    } catch (error) {
        console.log(error);
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