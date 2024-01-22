const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The feild is required'],
        unique: [true, 'Already exist the name.']
    },
    movieImage: {
        type: String,
        required: [true, 'The feild is required'],
        // validate: {
        //     validator: (value) => /^image\/(jpeg|jpg|png|gif)$/.test(value),
        //     message: 'Invalid image format. Supported formats: jpeg, png, gif'
        // }
    },
    releaseDate: {
        type: Date,
        required: [true, 'The feild is required']
    },
    category: {
        type: String,
        required: [true, 'The feild is required']
    },
    duration: {
        type: Number,
        required: [true, 'The feild is required']
    },
    actor: {
        type: String,
        required: [true, 'The feild is required']
    },
    genre: {
        type: String,
        required: [true, 'The feild is required']
    },
    rating: {
        type: Number,
        required: [true, 'The feild is required'],
        validate: {
            validator: (value)=>{
              return value > 0 && value <= 10;
            },
            message: 'Rating must be greater than 0 and less than or equal to 10',
          }
    },
    language: {
        type: String,
        required: [true, 'The feild is required']
    },
    description: {
        type: String,
        required: [true, 'The feild is required']
    },
    status:{
        type:String,
        default:'deactive'
    }
},{
    timestamps:true
}
)
module.exports = new mongoose.model('Movie', movieSchema)