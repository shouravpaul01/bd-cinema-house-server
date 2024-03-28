const mongoose = require('mongoose')

const showModel = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, 'The field is required.']
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: [true, "The field is required."],

        },
        showTimesTypesPrice: {
            type: [{
                time:{
                    type:Object,
                    required: [true, 'The field is required.']
                },
                seatTypesPrice: {
                    type: Array,
                    required: [true, 'The field is required.']
                },
                status: {
                    type: String,
                    default: 'deactive'
                }
            }],
            validate: {
                validator: (array)=>{
                  // Customize the validation logic here for the array of objects
                  return Array.isArray(array) && array.length > 0 
                },
                message: 'Array must be a non-empty array of strings.'
              }
        },

        status: {
            type: String,
            default: 'deactive'
        }

    },
    {
        timestamps: true
    }
)

module.exports = new mongoose.model('Show', showModel)