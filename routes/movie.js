const express = require('express')
const router = express.Router()
const movieModel = require('../models/movieModel');
const singleFileUpload = require('../middlewares/siingleFileUpload');
const deleteFileCloudinary = require('../utils/deleteFileCloudinary');
const fileUploadCloudinary = require('../utils/fileUploadCloudinary');






//Movie Store
router.post('/', singleFileUpload, async (req, res) => {
    const formData = JSON.parse(req.body.newData)
    console.log(formData,req.file);
    try {
        if (req.file) {
            const cloudinaryResult = await fileUploadCloudinary(req?.file?.path)
            formData['image'] = { public_id: cloudinaryResult.public_id, url: cloudinaryResult.secure_url }
        }
        const result = new movieModel(formData)
        if (result) {
            await result.save()
            res.status(200).json({ message: 'Successfully Added' })
        }
    } catch (err) {

        if (err.name === 'MongoServerError' && err.code === 11000) {
            res.json({ code: 204, validationErrors: [{ field: 'name', message: 'Already exist the name.' }] })
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
//Get all movies
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search
    
    try {
        const searchValue = {}
        if (search) {
            searchValue.name = { $regex: search, $options: 'i' }
        }
        if (!search && !req.query.page) {
            const data = await movieModel.find({})
            return res.status(200).json(data)
        }

        const totalCount = await movieModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await movieModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (err) {
        console.log("err", err);
    }
})
//Movie status updated by ID
router.patch('/update-status', async (req, res) => {

    try {
        const result = await movieModel.findByIdAndUpdate(req.query._id, { status: req.query.status },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})

// Specific movie deleted by ID
router.delete('/:_id', async (req, res) => {

    try {
        const findMovie = await movieModel.findById(req.params._id)

        if (findMovie) {
            await deleteFileCloudinary(findMovie.image.public_id)
        }

        await movieModel.deleteOne({ _id: req.params._id })
        res.status(200).json({ code: 200, message: "Successfully Deleted" })
    } catch (error) {
        console.log(error);
    }
})

// Get Specific movie data by ID
router.get('/edit-data/:_id', async (req, res) => {
    try {
        const result = await movieModel.findById(req.params._id)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
})

//Movie Data updated
router.patch('/', singleFileUpload, async (req, res) => {
    try {
        const formData = JSON.parse(req.body.newData)
        const file = req.file
        //Delete image
        if (!file) {
            delete formData['image']
        }
        if (file) {
            const findData = await movieModel.findById(formData._id)
            await deleteFileCloudinary(findData?.image?.public_id)
            const cloudinaryResult = await fileUploadCloudinary(req?.file?.path)
            formData['image'] = { public_id: cloudinaryResult.public_id, url: cloudinaryResult.secure_url }

        }
        const result = await movieModel.findByIdAndUpdate(formData._id, formData, { new: true })
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully Updated' })
        }
    } catch (err) {
        if (err.name === 'ValidationError') {
            // Handle validation error
            const validationErrors = Object.keys(err.errors).map(field => ({
                field,
                message: err.errors[field].message,
            }));
            res.json({ code: 204, validationErrors: validationErrors })
        } else {
            // Handle other errors
            console.error('err', err);
        }
    }

})



module.exports = router