const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({
    body: {
        type: String,
        default: ''
    },
    date: {
        type: Date
    }
})

const userSchema = new mongoose.Schema({
        userId: {
            type: Number,
            required: true,
            unique: true
        },
        login: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        shortName: {
            type: String,
            unique: true,
            default: ""
        },
        name: {
            type: String,
            default: ''
        },
        registrationDate: {
            type: Date
        },
        lastSeance: {
            type: Date
        },
        photoUrl: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            default: ""
        },
        messages: {
            type: Map,
            of: [messageSchema],
            default: new Map()
        }

    }
)

module.exports = mongoose.model('user', userSchema)