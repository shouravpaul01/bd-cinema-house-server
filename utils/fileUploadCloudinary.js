const cloudinary = require('cloudinary').v2;

const fileUploadCloudinary = async(filePath) => {
    try {
        return await cloudinary.uploader.upload(filePath,{
            folder:'bd_cinema_house/images'
        })
         
    } catch (err) {
        console.log(err);
    }
   
};

module.exports= fileUploadCloudinary