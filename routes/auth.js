const express = require('express')
const controller = require('../controllers/auth')
//const passport = require('passport')


const jwt = require('jsonwebtoken')
const JWT_KEY = require('../keys').JWT_KEY

const router = express.Router()


router.post('/login', controller.login)
router.post('/register', controller.register)
router.get('/login', controller.me)

/*router.get('/secret', passport.authenticate('jwt', {session: false}),(req, res) => {
    res.status(200).json({message: 'Welcome'})
})*/

router.get('/public', (req, res) => {
    try {
        const payload = jwt.verify(req.headers.token, JWT_KEY)
        res.status(200).json({payload: payload})
    } catch (e) {
        res.status(400).json({message: 'invalid token'})
    }
})

module.exports = router

//