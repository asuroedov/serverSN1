const User = require('../models/UserModel')


module.exports.getUsersList = async (req, res) => {
    try{
        let pageSize = +req.query.pageSize
        if(!pageSize || pageSize < 0 || pageSize > 10) pageSize = 5

        const totalCount = await User.countDocuments()
        const users = await User.find().sort({userId: -1}).limit(pageSize)
        const result = []
        users.forEach(el => result.push({login: el.login, name: el.name, shortName: el.shortName, photoUrl: el.photoUrl}))
        res.status(200).json({totalCount: totalCount, data: result})

    }catch (e) {
        res.status(400).json({resultCode: 1, message: 'getUsersList. some error', data: {}})
    }
}