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
        const user1 = await User.findById(payload._id)
        if(!user1) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})

        const userId = req.body.userId
        const user2 = await User.findOne({userId: userId})
        if(!user2) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})


        if(!user1.inFriends.has(userId.toString()) || !user2.outFriends.has(user1.userId.toString()))
            res.status(400).json({resultCode: 1, message: 'application not sent', data: {}})

        user1.inFriends.delete(userId.toString())
        user2.outFriends.delete(user1.userId.toString())

        const date = Date.now()
        if(!user1.currentFriends) user1.currentFriends = new Map()
        if(!user1.currentFriends.has(userId.toString()))
            user1.currentFriends.set(userId.toString(), date)

        if(!user2.currentFriends) user2.currentFriends = new Map()
        if(!user2.currentFriends.has(user1.userId.toString()))
            user2.currentFriends.set(user1.userId.toString(), date)

        await user1.save()
        await user2.save()

        res.status(200).json({resultCode: 0, message: '', data: {name: user2.name}})

    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'from catch', data: {}})
    }

}

module.exports.deleteFriend = async (req, res) => {

    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const user1 = await User.findById(payload._id)

        if(!user1) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})

        const userId = req.query.userId

        const user2 = await User.findOne({userId: userId})
        if(!user2) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})


        user1.currentFriends.delete(userId.toString())
        user2.currentFriends.delete(user1.userId.toString())

        await user1.save()
        await user2.save()


        res.status(200).json({resultCode: 0, message: '', data: {name: user2.name}})

    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'from catch', data: {}})
    }

}

//друзья указанного пользователя
module.exports.getUserFriends = async (req, res) => {

    try {
        const userId = req.query.userId

        const user = await User.findOne({userId: userId})
        if(!user) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})

        const ids = Array.from(user.currentFriends.keys())
        const friends = await Promise.all(ids.map(el => User.findOne({userId: el})))
        const result = friends.map(el => ({name: el.name, login: el.login, photoUrl: el.photoUrl, userId: el.userId, lastSeance: el.lastSeance }))

        res.status(200).json({resultCode: 0, message: '', data: {friends: result}})

    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'from catch', data: {}})
    }

}
