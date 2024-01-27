const express = require('express')
const router = express.Router()
const bookingModel = require('../models/bookingModel')

const SSLCommerzPayment = require('sslcommerz-lts')
const { transactionNumber } = require('../utils/transactionNumber')
const store_id = process.env.SSLCOMMERZ_STOREID
const store_passwd = process.env.SSLCOMMERZ_PASSWORD
const is_live = false

router.post('/', async (req, res) => {
    console.log(req.body);
    try {
        const result = new bookingModel(req.body)
        if (result) {
            await result.save()
            res.status(200).json(result)
        }
    } catch (err) {
        console.log(err);
    }
})
// Booking deleted by specific id
router.delete('/', async (req, res) => {
    const bookingId = req.query?.bookingId
    const seat = req.query?.seat

    try {
        if (bookingId && seat) {
            console.log(bookingId);
            console.log(seat);
            const result = await bookingModel.findOneAndUpdate(
                { _id: bookingId },
                { $pull: { seat: seat } },
                { new: true }
            )
            res.status(200).json(result)
        }
        if (bookingId && !seat) {
            console.log(bookingId);
            console.log(seat);
            await bookingModel.deleteOne({ _id: bookingId })
            res.status(200).json({ code: 200, message: "Successfully Deleted" })
        }

    } catch (error) {
        console.log(error);
    }
})
router.patch('/:bookingId', async (req, res) => {
    try {
        const result = await bookingModel.findByIdAndUpdate(req.params.bookingId, req.body, { new: true })
        if (result) {
            await result.save()
            res.status(200).json(result)
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/purchase-confirm/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId
    const bookingData = await bookingModel.findById(req.params.bookingId);
    const tranId = transactionNumber()
    console.log(bookingData);
    const data = {
        total_amount: bookingData?.totalAmount,
        currency: 'BDT',
        tran_id: tranId, // use unique tran_id for each api call
        success_url: `http://localhost:3000/booking/payment/success/${bookingId}`,
        fail_url: `http://localhost:3000/booking/payment/cencel/${bookingId}`,
        cancel_url: `http://localhost:3000/booking/payment/cencel/${bookingId}`,
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(async (apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
       const result= await bookingModel.updateOne({ _id: bookingId }, {
            $set: {
                tranId: tranId,
                name: req.body.name,
                phoneNumber: req.body.phoneNumber
            }
        });
        if (result.modifiedCount>0) {
            res.json({ url: GatewayPageURL })
        }
        
        console.log('Redirecting to: ', GatewayPageURL)
    });


})
router.post('/payment/success/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId
    try {
        const result = await bookingModel.updateOne({ _id: bookingId },{ $set: { status: 'active' } });
       console.log(result);
        if (result.modifiedCount>0) {
            res.redirect(`http://localhost:5173/ticket-booking/success/${bookingId}`)
        }
    } catch (error) {
        console.log(error.message);
    }

})
router.post('/payment/cencel/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId
    try {
        const result = await bookingModel.deleteOne({ _id: bookingId });
       console.log(result);
        if (result.deletedCount>0) {
            res.redirect(`http://localhost:5173/ticket-booking/cencel/${bookingId}`)
        }
    } catch (error) {
        console.log(error.message);
    }

})
router.get('/match-by',async(req,res)=>{
   try {
    const bookedSeats = await bookingModel.find({movie:req.query.movie,date:req.query.date,time:req.query.time,seatType:req.query.seatType}).select('-_id seat');
    
    
    if (bookedSeats.length > 0) {
        const newBookedSeats=[].concat(...bookedSeats.map(bookedSeat => bookedSeat.seat));
       res.json(newBookedSeats)
      
    } 
   } catch (err) {
    console.log(err.message);
   }
   
})
router.get('/my-booking', async (req, res) => {
    const {bookingId,email}=req.query
    try {
        if (bookingId && email) {
            const result = await bookingModel.findOne({ _id: bookingId, email: email }).populate('movie');
            if (result) {
                return res.json(result)
            }
        }
        const result = await bookingModel.find({ email: req.query.email }).populate('movie');
        if (result.length>0) {
            res.json(result)
        }
    } catch (error) {
        console.log(error.message);
    }

})
router.get('/all-booking', async (req, res) => {
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
        const totalCount = await bookingModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await bookingModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize).populate('movie').sort({createdAt:-1});

        res.status(200).json({ data, totalPages })
        
        
    } catch (error) {
        console.log(error.message);
    }

})
module.exports = router