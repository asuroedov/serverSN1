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
    },
    isRead: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('message', messageSchema)