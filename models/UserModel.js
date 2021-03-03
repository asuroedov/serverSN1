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
            type: Date,
            default: new Date()
        },
        lastSeance: {
            type: Date
        },
        photoUrl: {
            type: String
        },
        location: {
            type: String
        },
        status: {
            type: String
        }

    }
)

module.exports = mongoose.model('user', userSchema)