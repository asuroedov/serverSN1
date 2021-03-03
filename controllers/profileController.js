const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
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

        console.log('photourl ' + candidate.photoUrl)

        res.status(200).json({resultCode: 0, message: '', data: {login: candidate.login, name: candidate.name, registrationDate: candidate.registrationDate
            , userId: candidate.userId, photoUrl: candidate.photoUrl}})
    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'user not found from catch', data: {}})
    }

}


module.exports.getPhoto = async (req, res) => {

    const photoId = req.params.photoId
    const base = __dirname.slice(0, __dirname.indexOf('\\'))
    const filePath = base + `\\serverSN\\uploads\\photos\\${photoId}`

    res.status(200).sendFile(filePath)
}

module.exports.postPhoto = async (req, res) => {
    try{
        console.log(req.headers.token)
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findById(payload._id)
        if(!candidate) res.status(404).json({resultCode: 1, message: 'error upload photo. User not found', data: {}})

        const file = req.files.image

        if(file.size > 1024 * 1024 * 5)
            res.status(400).json({resultCode: 1, message: 'large file. max 5mb', data: {}})
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {

            // win
            const base = __dirname.slice(0, __dirname.indexOf('\\'))
            const filePath = base + `\\serverSN\\uploads\\photos\\`

            //lin
            //const filePath = '/root/serverSN1/uploads/' + candidate.userId + '/'

            const count = fs.readdirSync(filePath).length
            const ext = path.extname(file.name)
            file.name = `${count + 1}` + ext

            await file.mv(filePath + file.name)

            await User.findByIdAndUpdate(payload._id, {photoUrl: `/photo/${file.name}`})

            res.status(200).json({resultCode: 0, message: '', data: {photoUrl: `/photo/${file.name}`}})
        } else {
            res.status(400).json({resultCode: 1, message: 'не верный формат', data: {}})
        }

    }catch (e) {
        res.status(404).json({resultCode: 1, message: 'error upload photo', data: {}})
    }
}
//