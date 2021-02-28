const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const JWT_KEY = require('../keys').JWT_KEY

module.exports.getProfile = async (req, res) => {

    try {
        let userId = null
        let candidate = null

        if (req.params.userId) {
            userId = +req.params.userId
        } else if (req.headers.token) {
            const payload = jwt.verify(req.headers.token, JWT_KEY)
            candidate = await User.findOne({login: payload.login})
            if (candidate) {
                userId = candidate.userId
            }
        }

        console.log(userId)
        if (!userId) {
            res.status(404).json({resultCode: 1, message: 'user not found', data: {}})
        }

        if (!candidate)
            candidate = await User.findOne({userId: userId})
        if (!candidate) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})


        res.status(200).json({resultCode: 0, message: '', data: {login: candidate.login, name: candidate.name, registrationDate: candidate.registrationDate
            , userId: candidate.userId}})
    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'user not found from catch', data: {}})
    }

}