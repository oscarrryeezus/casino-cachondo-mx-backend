const express = require("express");
const router = express.Router();
let cors = require("cors");
const bodyparser = require("body-parser");
router.use(express.json());
router.use(cors());
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

const roulette_routes = require('./routes/roulette.routes')
const usuario_routes = require('./routes/user.routes')
const blackjackRoutes = require('./routes/blackjack.routes');

router.use('/roulette', roulette_routes);
router.use('/usuario', usuario_routes)
router.use('/blackjack', blackjackRoutes);

module.exports = router;