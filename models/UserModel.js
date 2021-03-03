const mongoose = require('mongoose')

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
        name: {
            type: String
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
        }

    }
)

module.exports = mongoose.model('user', userSchema)