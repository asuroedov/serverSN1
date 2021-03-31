const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const JWT_KEY = require('../keys').JWT_KEY
const {v4: uuidv4} = require('uuid');
const io = require('../index')
const connections = require('../connections')

module.exports.acceptFriend = async (req, res) => {

    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findById(payload._id)
        if(!candidate) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})

        const userId = req.body.userId
        const user = await User.findOne({userId: userId})
        if(!user) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})


        if(!candidate.inFriends.has(userId.toString()) || !user.outFriends.has(candidate.userId.toString()))
            res.status(400).json({resultCode: 1, message: 'application not sent', data: {}})

        candidate.inFriends.delete(userId.toString())
        user.outFriends.delete(candidate.userId.toString())

        const date = Date.now()
        if(!candidate.currentFriends) candidate.currentFriends = new Map()
        if(!candidate.currentFriends.has(userId.toString()))
            candidate.currentFriends.set(userId.toString(), date)

        if(!user.currentFriends) user.currentFriends = new Map()
        if(!user.currentFriends.has(candidate.userId.toString()))
            user.currentFriends.set(candidate.userId.toString(), date)

        await candidate.save()
        await user.save()


            console.log(connections.get(userId.toString()))
            console.log(connections.get(candidate.userId.toString()))

        if(connections.has(userId.toString()))
            io.to(connections.get(userId.toString())).emit('FRIEND:ADDED')
        if(connections.has(candidate.userId.toString()))
            io.to(connections.get(candidate.userId.toString())).emit('FRIEND:ADDED')

        res.status(200).json({resultCode: 0, message: '', data: {}})

    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'from catch', data: {}})
    }

}
