const express = require('express')
const controller = require('../controllers/profileController')

const router = express.Router()


router.get(`/profile`, controller.getProfile)
router.get(`/profile/:userId`, controller.getProfile)
router.get(`/photo/:userId`, controller.getPhoto)
router.post(`/photo`, controller.postPhoto)


module.exports = router