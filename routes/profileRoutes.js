const express = require('express')
const controller = require('../controllers/profileController')

const router = express.Router()


router.get(`/profile`, controller.getProfile)
router.get(`/profile/:userId`, controller.getProfile)


module.exports = router