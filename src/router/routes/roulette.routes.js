const express = require('express')
const router = express.Router()
const spinRoulette = require('../../controllers/roulette.controller')

router.post('/play', spinRoulette.spinRoulette)

module.exports = router
