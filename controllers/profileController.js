const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const JWT_KEY = require('../keys').JWT_KEY
const {v4: uuidv4} = require('uuid');

module.exports.getProfile = async (req, res) => {

    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const sender = await User.findOne({login: payload.login})
        const candidate = req.params.userId ? await User.findOne({userId: req.params.userId})
            : User.findOne({login: jwt.verify(req.headers.token, JWT_KEY).login})

        sender.lastSeance = Date.now()
        await sender.save()

        if (!candidate) res.status(404).json({resultCode: 1, message: 'user not found', data: {}})

        res.status(200).json({
            resultCode: 0, message: '', data:
                {
                    login: candidate.login, name: candidate.name, registrationDate: candidate.registrationDate
                    , userId: candidate.userId, photoUrl: candidate.photoUrl, status: candidate.status,
                    lastSeance: candidate.lastSeance, location: candidate.location
                }
        })
    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'user not found from catch', data: {}})
    }

}

module.exports.updateProfile = async (req, res) => {
    try{
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findById(payload._id)
        if (!candidate) res.status(404).json({resultCode: 1, message: 'error update profile. User not found', data: {}})

        candidate.name = req.body.name
        candidate.status = req.body.status
        candidate.location = req.body.location
        candidate.lastSeance = Date.now()

        await candidate.save()
        res.status(200).json({resultCode: 0, message: '', data: {name: candidate.name, location: candidate.location, status: candidate.status}})

    }catch (e){
        res.status(400).json({resultCode: 1, message: 'updateProfile. some eror', data: {}})
    }
}


module.exports.getPhoto = async (req, res) => {

    const photoId = req.params.photoId
    const base = __dirname.slice(0, __dirname.indexOf('\\'))
    const filePath = base + `\\react\\serverSN1\\uploads\\photos\\${photoId}`
    //const filePath = `/root/serverSN1/uploads/photos/${photoId}`

    res.status(200).sendFile(filePath)
}

module.exports.postPhoto = async (req, res) => {
    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        const candidate = await User.findById(payload._id)
        if (!candidate) res.status(404).json({resultCode: 1, message: 'error upload photo. User not found', data: {}})

        const file = req.files.image

        if (file.size > 1024 * 1024 * 5)
            res.status(400).json({resultCode: 1, message: 'large file. max 5mb', data: {}})
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {

            // win
            const base = __dirname.slice(0, __dirname.indexOf('\\'))
            const filePath = base + `\\react\\serverSN1\\uploads\\photos\\`

            //lin
            //const filePath = '/root/serverSN1/uploads/photos/'

            const ext = path.extname(file.name)
            file.name = uuidv4() + ext

            await file.mv(filePath + file.name)

            await User.findByIdAndUpdate(payload._id, {photoUrl: `/photo/${file.name}`})

            candidate.lastSeance = Date.now()
            await candidate.save()

            res.status(200).json({resultCode: 0, message: '', data: {photoUrl: `/photo/${file.name}`}})
        } else {
            res.status(400).json({resultCode: 1, message: 'не верный формат', data: {}})
        }

    } catch (e) {
        res.status(404).json({resultCode: 1, message: 'error upload photo', data: {}})
    }
}
//