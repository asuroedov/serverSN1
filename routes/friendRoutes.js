const express = require('express')
const controller = require('../controllers/friendController')

const router = express.Router()

router.post(`/friend`, controller.acceptFriend)

module.exports = router