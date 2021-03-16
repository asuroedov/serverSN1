const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({
    body: {
        type: String,
        default: ''
    },
    date: {
        type: Date
    },
    isSelf: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('message', messageSchema)