const fs = require('fs');
const path = require('path');

const deleteFile = async(file) => {
    // console.log(file);
    const deleteFile = path.join('public', 'uploads', file);
     fs.unlinkSync(deleteFile)
}
module.exports=deleteFile