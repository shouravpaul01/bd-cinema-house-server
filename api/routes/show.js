const express = require('express')
const router = express.Router()
const showModel = require('../models/showModel')

//Get all movie show
router.get('/', async (req, res) => {
    try {
        const result = await showModel.find({}).populate('movie')
        res.status(200).json(result)
    } catch (err) {
        console.log("err", err);
    }
})
// Get Specific movies show data by ID
router.get('/edit-data', async (req, res) => {

    const timeTypePriceId = req.query.timeTypePriceId
    try {
        if (req.query.showId && req.query.timeTypePriceId) {
            console.log(req.query.showId, req.query.time);
            const result = await showModel.findById({ _id: req.query.showId }, { showTimesTypesPrice: { $elemMatch: { _id: timeTypePriceId } }, date: 1 }).populate('movie')
            console.log('dd', result);
            return res.status(200).json(result)
        }
        if (req.query.showId) {
            const result = await showModel.findById(req.query.showId).select('_id date movie').populate('movie')
            console.log(result);
            return res.status(200).json(result)
        }


    } catch (err) {
        console.log('err', err.message);
    }
})

// Client/Frontend Api

//Get all movie show date
router.get('/active-movie-show-date', async (req, res) => {
    try {
        const result = await showModel.distinct('date',{status:'active'})
        
        res.status(200).json(result)
    } catch (err) {
        console.log("err", err);
    }
})
//Get movies by date schedule
router.get('/active-movies-by-date', async (req, res) => {
    try {
        const result = await showModel.find({date:req.query.date,status:'active'}).populate('movie')
        
        res.status(200).json(result)
    } catch (err) {
        console.log("err", err);
    }
})

router.get('/active-movie-by-id/:_id', async (req, res) => {
    try {
        const result = await showModel.findOne({_id:req.params._id,status:'active'}).populate('movie')
        console.log(result);
        res.status(200).json(result)
    } catch (err) {
        console.log("err", err);
    }
})

router.get('/active-movie-seat-type-by-id', async (req, res) => {
    const showId=req.query.showId
    const timeTypePriceId=req.query.timeTypePriceId
    console.log(showId,timeTypePriceId);
    try {
        const result = await showModel.findById({ _id: showId }, { showTimesTypesPrice: { $elemMatch: { _id: timeTypePriceId } }}).populate('movie')
        console.log(result);
        res.status(200).json(result)
    } catch (err) {
        console.log("err", err);
    }
})
//Movie show Store
router.post('/', async (req, res) => {
    console.log(req.body.date);
    try {
        const checkMovie = await showModel.find({ date: req.body.date, movie: req.body.movie})

        if (checkMovie.length > 0) {

            return res.json({ uniqueErrorCode: 204, uniqueErrorMessage: "Already fixed the movie show schedule.If you went to change movie show times then tigger the shows button and click edit button of the movie and finally    change movie show times" })
        }
        const checkShowTime = await showModel.find({ date: req.body.date,showTimesTypesPrice: { $elemMatch: { time: req.body.showTimesTypesPrice[0].time } } })
        if (checkShowTime.length > 0) {

            return res.json({ uniqueErrorCode: 204, uniqueErrorMessage: "Already fixed the movie show schedule.If you went to change movie show times then tigger the shows button and click edit button of the movie and finally    change movie show times" })
        }
        const checkShowsDateAndName = await showModel.find({ date: req.body.date, movie: req.body.movie })

        if (checkShowsDateAndName.length > 0) {
            console.log("checkShowsDateAndName", checkShowsDateAndName, checkShowsDateAndName[0]._id);
            const result = await showModel.findByIdAndUpdate(checkShowsDateAndName[0]._id, { $push: { showTimesTypesPrice: req.body.showTimesTypesPrice[0] } }, { new: true })
            console.log(result);
            return res.status(200).json({ code: 200, message: 'Successfully added' })
        }

        const result = new showModel(req.body)
        if (result) {
            console.log('hi');
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully added' })
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
            console.error('err', err.message);
        }
    }

})

// Movies show deleted by specific id
router.delete('/show-time-type-price', async (req, res) => {
    try {
        await showModel.findByIdAndUpdate(
            req.query.showId,
            { $pull: { showTimesTypesPrice: { _id: req.query.timeTypePriceId } } },
            { new: true })
        res.status(200).json({ code: 200, message: "Successfully Deleted" })
    } catch (error) {
        console.log(error);
    }
})
// Movies show deleted by specific id
router.delete('/:_id', async (req, res) => {

    try {
        await showModel.deleteOne({ _id: req.params._id })
        res.status(200).json({ code: 200, message: "Successfully Deleted" })
    } catch (error) {
        console.log(error);
    }
})

//Movies show status updated by ID
router.patch('/update-status', async (req, res) => {

    try {
        const result = await showModel.findByIdAndUpdate(req.query._id, { status: req.query.status },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})



//Movie Data updated
router.patch('/', async (req, res) => {
    const timeTypePriceId = req.body.timeTypePriceId
    try {

        if (timeTypePriceId) {
            await showModel.findOneAndUpdate(
                { _id: req.body.showId, 'showTimesTypesPrice._id': timeTypePriceId },
                { $set: { 'showTimesTypesPrice.$': req.body.showTimesTypesPrice[0] } },
                { new: true })

            return res.status(200).json({ code: 200, message: 'Successfully Updated' })
        }
        const checkShowTime= await showModel.find({ date: req.body.date, showTimesTypesPrice: { $elemMatch: { time: req.body.showTimesTypesPrice[0].time } } })
        const checkShowsDateAndName = await showModel.find({ date: req.body.date, movie: req.body.movie })

        if (checkShowsDateAndName.length > 0) {
            if (checkShowTime.length > 0) {
                return res.json({ uniqueErrorCode: 204, uniqueErrorMessage: "Already fixed the movie show schedule.Please set different show schedule time."})
            }
            const result = await showModel.findByIdAndUpdate(checkShowsDateAndName[0]._id, { $push: { showTimesTypesPrice: req.body.showTimesTypesPrice[0] } }, { new: true })
            console.log(result);
            return res.status(200).json({ code: 200, message: 'Successfully added' })
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