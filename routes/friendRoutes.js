const express = require('express')
const controller = require('../controllers/friendController')

const router = express.Router()

router.post(`/friend`, controller.acceptFriend)
router.delete(`/friend`, controller.deleteFriend)
router.get(`/friends`, controller.getUserFriends)

module.exports = router