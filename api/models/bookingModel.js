const mongoose = require('mongoose')

const bookingModel = new mongoose.Schema({
    email: {
        type: String
    },
    name: {
        type: String
    },
    phoneNumber: {
        type: Number
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
    },
    time: {
        type: String
    },
    seatType: {
        type: String
    },
    seat: {
        type: Array
    },
    date: {
        type: Date
    },
    totalAmount: {
        type: Number
    },
    tranId: {
        type: String
    },
    status: {
        type: String,
        default: 'inactive'
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model('Booking', bookingModel)