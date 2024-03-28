const cloudinary = require('cloudinary').v2;

const deleteFileCloudinary = async(public_id) => {
   await cloudinary.uploader.destroy(public_id)
};

module.exports=deleteFileCloudinary;