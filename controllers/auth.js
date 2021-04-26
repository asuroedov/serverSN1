const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const JWT_KEY = require('../keys').JWT_KEY

module.exports.login = async (req, res) => {
    const candidate = await User.findOne({login: req.body.login})
    if(candidate){
        if(bcrypt.compareSync(req.body.password, candidate.password)){
            const token = jwt.sign({
                login: candidate.login,
                _id: candidate._id
            }, JWT_KEY, {expiresIn: 90 * 24 * 60 * 60})

            candidate.lastSeance = Date.now()
            await candidate.save()
            res.status(200).json({resultCode: 0, message: '', data: {userId: candidate.userId, login: candidate.login, token}})
        }else{
            res.status(404).json({resultCode: 1, message: 'incorrect login or password'})
        }

    } else {
        res.status(404).json({resultCode: 1, message: 'incorrect login or password'})
    }

}

module.exports.me = async (req, res) => {
    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findOne({login: payload.login})
        res.status(200).json({resultCode: 0, message: '', data: {userId: candidate.userId, login: candidate.login, token: req.headers.token
        , photoUrl: candidate.photoUrl, name: candidate.name}})
    } catch (e) {
        res.status(400).json({message: 'invalid token'})
    }
}

module.exports.registration = async (req, res) => {

    const candidate = await User.findOne({login: req.body.login})

    if (candidate) {
        res.status(409).json({resultCode: 2, message: 'user with this login already exist '})
    } else {
        const totalUsersCount = await User.countDocuments()
        const salt = bcrypt.genSaltSync(10)

        const welcomeMessage = 'Приветственное сообщение! \nДля того, чтобы написать другому пользователю - зайдите в его профиль и нажмите на конпку "отправить сообщение". \nПопереписываться с самим собой можно, зайдя с другого браузера и другого аккаунта.\nЭто сообщение было сгенерировано автоматический'
        const m = new Map()
        m.set('1', [{body: welcomeMessage, isSelf: false, isRead: true, date: Date.now()}])

        const user = new User({
            userId: totalUsersCount + 1,
            login: req.body.login,
            password: bcrypt.hashSync(req.body.password, salt),
            name: req.body.name,
            registrationDate: Date.now(),
            lastSeance: Date.now(),
            photoUrl: '',
            messages: m
        })

        try {
            await user.save()
            const admin = await User.findOne({userId: 1})
            admin.messages.set(user.userId.toString(), [{body: welcomeMessage, isSelf: true, isRead: true, date: Date.now()}])
            await admin.save()
            res.status(200).json({resultCode: 0, message: '', data: {}})
        } catch (e) {
            console.log(e)
            res.status(400).json({resultCode: 1, message: 'some error'})
        }
    }

}

