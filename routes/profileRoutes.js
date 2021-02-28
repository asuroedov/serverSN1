const express = require('express')
const controller = require('../controllers/profileController')

const router = express.Router()


router.post(`/profile`, controller.getProfile)
router.post(`/profile/:userId`, controller.getProfile)


module.exports = router