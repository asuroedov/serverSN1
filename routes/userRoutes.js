const express = require('express')
const controller = require('../controllers/userController')

const router = express.Router()

router.get(`/users`, controller.getUsersList)



module.exports = router