const multer=require('multer')

const uploader=multer({
    storage:multer.diskStorage({})
})

const singleFileUpload=uploader.single('file')

module.exports=singleFileUpload