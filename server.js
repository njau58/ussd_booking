const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const port = process.env.PORT
const app = express()
const bookingRoute = require('./routes/index')
const dbURI =process.env.URI




//Middlewares 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:false
}))

//connection to mongoDB

mongoose.connect(dbURI)
.then(result=>{
    app.listen(port,(req,res)=>console.log(`server running on port ${port}`) )

})
.catch(error=>console.log(error))

app.use('/',bookingRoute)
app.get('/test', (req, res)=>{
    res.send('Success')
})
























