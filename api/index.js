const express=require('express')
const cors=require('cors')
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()
const movie=require('../api/routes/movie')
const show=require('../api/routes/show')
const user=require('../api/routes/user')
const booking=require('../api/routes/booking')

const app=express()
app.use(express.json())
app.use(cors())
app.use(express.static('public'));

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8sp76yj.mongodb.net/bdCinemaHouseDB?retryWrites=true&w=majority`).then(()=>console.log('Succesfully connect with server')).catch((err)=>console.log(err))
app.get('/api',(req,res)=>{
    res.send('hello world')
})

app.use('/user',user)
app.use('/movie',movie)
app.use('/show',show)
app.use('/booking',booking)


app.listen(3000,(req,res)=>{
    console.log('Port is',3000);
})

module.exports=app
