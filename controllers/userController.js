const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')

const JWT_KEY = require('../keys').JWT_KEY


module.exports.getUsersList = async (req, res) => {
    try {
        let pageSize = +req.query.pageSize
        if (!pageSize || pageSize < 0 || pageSize > 10) pageSize = 5

        let pageNumber = +req.query.pageNumber
        if (!pageNumber || pageNumber < 0) pageNumber = 1

        let line = req.query.queryLine
        if (!line) line = ''
        line = new RegExp(line, 'i')

        const users = await User.find({login: {$regex: line}}).sort({userId: -1})

        let result = []
        users.forEach(el => result.push({
            login: el.login,
            userId: el.userId,
            name: el.name,
            shortName: el.shortName,
            photoUrl: el.photoUrl
        }))

        const totalCount = result.length
        const left = (pageNumber - 1) * pageSize
        const right = pageNumber * pageSize
        result = result.filter((el, ind) => (ind >= left && ind < right))

        res.status(200).json({resultCode: 0, message: '', data: {totalCount: totalCount, users: result}})

    } catch (e) {
        res.status(400).json({resultCode: 1, message: 'getUsersList. some error', data: {}})
    }
}

module.exports.getUsersByIds = async (req, res) => {
    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findOne({login: payload.login})
        if (!candidate) res.status(400).json({resultCode: 1, message: 'getUsersByIds: candidate not found', data: {}})

        const {ids} = req.body
        const p = ids.map(async el => await User.findOne({userId: el}))

        const result = []
        const lastMessages = new Map()
        const users = await Promise.all(p)
        users.forEach(el => result.push({
            name: el.name,
            photoUrl: el.photoUrl,
            userId: el.userId,
            shortName: el.shortName,
            login: el.login
        }))

        users.forEach((el) => {
            const arr = el.messages.get(candidate.userId.toString()) // arr of messages with candidate
            lastMessages.set(el.userId.toString(), arr[arr.length - 1].date)
        })

        res.status(200).json({resultCode: 0, message: '', data: {users: result, lastMessages: Object.fromEntries(lastMessages.entries())}})

    } catch
        (e) {
        console.log(e)
        res.status(400).json({resultCode: 1, message: 'getUsersByIds. some error', data: {}})
    }
}


module.exports.getLastMessages = async (req, res) => {
    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findOne({login: payload.login})
        if (!candidate) res.status(400).json({resultCode: 1, message: 'getUsersByIds: candidate not found', data: {}})

        const lastMessages = new Map()

        candidate.messages.forEach((value, key) => {
            lastMessages.set(key.toString(), value[value.length - 1])
        })


        res.status(200).json({resultCode: 0, message: '', data: {lastMessages: Object.fromEntries(lastMessages.entries())}})

    } catch
        (e) {
        console.log(e)
        res.status(400).json({resultCode: 1, message: 'getUsersByIds. some error', data: {}})
    }
}