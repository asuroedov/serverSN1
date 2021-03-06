const express = require('express')
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profileRoutes')
const userRoutes = require('./routes/userRoutes')
const friendRoutes = require('./routes/friendRoutes')
const bodyParser = require('body-parser')
const app = express()


const passDB = require('./keys').DB_PASS
mongoose.connect(`mongodb+srv://asuroedov:${passDB}@cluster0.ey8l8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
    .then(() => {
        console.log('mongo db connected')
    })
    .catch(error => console.log(error))



/*app.use(passport.initialize())
require('./middleware/passport')(passport)*/

app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cors')())
app.use(fileUpload({}))



app.use('/', authRoutes)
app.use('/', profileRoutes)
app.use('/', userRoutes)
app.use('/', friendRoutes)


module.exports = app