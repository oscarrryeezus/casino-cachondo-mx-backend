const express = require('express');
const router = express.Router();
const { jugarBlackjack } = require('../../controllers/blackjackController');

// Ruta POST para jugar una partida
router.post('/jugar', jugarBlackjack);

module.exports = router;
