const express = require('express')
const controller = require('../controllers/friendController')

const router = express.Router()

router.post(`/friend`, controller.acceptFriend)
router.delete(`/friend`, controller.deleteFriend)

module.exports = router