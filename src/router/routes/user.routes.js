const express = require('express')
const router = express.Router()
const usuario_controller = require('../../controllers/user.controller')

router.post('/', usuario_controller.createUser)

module.exports = router
