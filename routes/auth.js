const express = require('express')
const controller = require('../controllers/auth')
//const passport = require('passport')
const User = require('../models/UserModel')


const jwt = require('jsonwebtoken')
const JWT_KEY = require('../keys').JWT_KEY

const router = express.Router()


router.post('/login', controller.login)
router.post('/registration', controller.registration)
router.get('/login', controller.me)

router.get('/public', async (req, res) => {
    /*try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        res.status(200).json({payload: payload})
    } catch (e) {
        res.status(400).json({message: 'invalid token'})
    }*/

    const payload = jwt.verify(req.headers.token, JWT_KEY)
    const user = await User.findById(payload._id)
    user.messages.set('he', [...user.messages.get('he'), {body: req.query.message, date: Date.now()}])
    await user.save()

    console.log(user.messages)
    res.status(200).json({messages: user.messages})
})

router.post('/public', async (req, res) => {

    const payload = jwt.verify(req.headers.token, JWT_KEY)
    const user = await User.findById(payload._id)

    const {message, to} = req.body
    console.log(to + ' ' + message)
    console.log(user.messages.get(to.toString()))

    if(!user.messages.has(to)){
        user.messages.set(to, {body: message, date: Date.now()})
        await user.save()

        res.status(200).json({messages: user.messages})
    }

    user.messages.set(to, [...user.messages.get(to), {body: message, date: Date.now()}])
    await user.save()

    res.status(200).json({messages: user.messages})
})

module.exports = router

//