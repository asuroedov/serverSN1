const express = require('express')
const authRoutes = require('./routes/auth')
const bodyParser = require('body-parser')
const app = express()

app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cors')())



app.use('/', authRoutes)


module.exports = app