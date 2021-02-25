const bcrypt = require('bcryptjs')
const User = require('../models/UserModel')


module.exports.login = (req, res) => {
    res.status(200).json({
            email: req.body.email,
            password: req.body.password
        }
    )
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

