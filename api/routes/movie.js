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

router.get('/', async (req, res) => {
    try {
        const result = await movieModel.find({})
        res.status(200).json(result)
    } catch (error) {

    }
})

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
            console.log('unique');
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
router.get('/edit-data/:_id', async (req, res) => {
    try {
        const result = await movieModel.findById(req.params._id)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
})
router.patch('/', upload.single('movieImage'), async (req, res) => {
    const data = JSON.parse(req.body.newData)

    try {
        const findData = await movieModel.findById(data._id)

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