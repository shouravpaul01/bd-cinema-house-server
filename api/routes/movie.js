const express = require('express')
const router = express.Router()
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const movieModel = require('../models/movieModel');
const deleteFile = require('../utils/deleteFile');

const publicDirectory = 'public';
const uploadDirectory = 'public/uploads';

// Check if the uploads folder exists, and create it if it doesn't
if (!fs.existsSync(publicDirectory)) {
    fs.mkdirSync(publicDirectory);
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory);
    }
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory) // Uploads will be stored in the 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname) // File will be named with timestamp + original name
    }
});
const upload = multer({ storage: storage });

//Get all movies
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search
    console.log(search);
    try {
        const searchValue = {}
        if (search !== 'null') {
            searchValue.name = { $regex: search, $options: 'i' }
        }
        if (!search) {
            const data = await movieModel.find({})
            return res.status(200).json(data)
        }
        console.log(searchValue);
        const totalCount = await movieModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await movieModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (err) {
        console.log("err", err);
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

//Movie Store
router.post('/', upload.single('movieImage'), async (req, res) => {
    const data = JSON.parse(req.body.newData)
    data['movieImage'] = req.file.filename
    try {
        const result = new movieModel(data)
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully added' })
        }
    } catch (err) {

        // Delete movie image when error
        if (req?.file?.filename) {
            deleteFile(req.file.filename)
        }

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
        const findData = await movieModel.findById(req.params._id)

        if (findData) {
            deleteFile(findData.movieImage)
        }

        await movieModel.deleteOne({ _id: req.params._id })
        res.status(200).json({ code: 200, message: "Successfully Deleted" })
    } catch (error) {
        console.log(error);
    }
})



//Movie Data updated
router.patch('/', upload.single('movieImage'), async (req, res) => {
    const data = JSON.parse(req.body.newData)

    try {
        const findData = await movieModel.findById(data._id)

        //Delete image
        if (req?.file?.filename) {
            if (findData) {
                data['movieImage'] = req.file.filename
                deleteFile(findData.movieImage)
            }
        }
        const result = await movieModel.findByIdAndUpdate(data._id, data, { new: true })
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully Updated' })
        }
    } catch (err) {

        if (req?.file?.filename) {
            deleteFile(req.file.filename)
        }

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