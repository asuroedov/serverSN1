const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')
const bodyParser = require('body-parser')
const app = express()

mongoose.connect(`mongodb+srv://asuroedov:121212q@cluster0.wojtu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
    .then(() => {
        console.log('mongo db connected')
    })
    .catch(error => console.log(error))

app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cors')())



app.use('/', authRoutes)


module.exports = app