const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The field is required.']
    },
    email: {
        type: String,
        required: [true, 'The field is required.'],
        unique: [true, 'Already exist the email.']
    },
    phoneNumber: {
        type: Number,
    },
    role: {
        type:String,
        default:'claint',
    },
}, {
    timestamps: true
})

module.exports = new mongoose.model('User', userModel)