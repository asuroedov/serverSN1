const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const JWT_KEY = 'dev'

module.exports.login = async (req, res) => {
    const candidate = await User.findOne({login: req.body.login})
    if(candidate){
        if(bcrypt.compareSync(req.body.password, candidate.password)){
            const token = jwt.sign({
                login: candidate.login,
                userId: candidate.userId
            }, JWT_KEY, {expiresIn: 60 * 60})

            res.status(200).json({resultCode: 0, message: '', data: {token: token}})
        }else{
            res.status(404).json({resultCode: 1, message: 'incorrect login or password'})
        }

    } else {
        res.status(404).json({resultCode: 1, message: 'incorrect login or password'})
    }

}

module.exports.register = async (req, res) => {

    const candidate = await User.findOne({login: req.body.login})

    if (candidate) {
        res.status(409).json({resultCode: 1, message: 'user with this login already exist '})
    } else {
        const salt = bcrypt.genSaltSync(10)

        const user = new User({
            userId: Date.now(),
            login: req.body.login,
            password: bcrypt.hashSync(req.body.password, salt)
        })

        try {
            await user.save()
            res.status(200).json({resultCode: 0, message: '', temp: user})
        } catch (e) {
            res.status(400).json({resultCode: 1, message: 'some error'})
        }
    }

}

