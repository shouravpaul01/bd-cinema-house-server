const express=require('express')
require('dotenv').config();
const cors=require('cors')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const app=express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const user=require('./routes/user')
const jwt=require('./routes/jwt')
const movie=require('./routes/movie')
const show=require('./routes/show')
const booking=require('./routes/booking')


const dbConnection=async()=>{
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8sp76yj.mongodb.net/inventoryManagementDB?retryWrites=true&w=majority`);
    console.log('Successfully DB colnected');
}
dbConnection().catch(err=>console.log(err))

cloudinary.config({
    cloud_name:`${process.env.CLOUD_NAME}`,
    api_key:`${process.env.API_KEY}`,
    api_secret:`${process.env.API_SECRET}`
})

app.use('/user',user)
app.use('/jwt',jwt)
app.use('/movie',movie)
app.use('/show',show)
app.use('/booking',booking)


app.get('/',(req,res)=>{
    res.send('Hello...Welcome')
})
app.listen(port,()=>{
    console.log(`The app listening on port ${port}`)
})

module.exports=app
