const express = require('express')
const router = express.Router()
const usuario_controller = require('../../controllers/user.controller')
const auth = require('../../middlewares/auth')

router.post('/', usuario_controller.createUser);
router.post('/cards',auth, usuario_controller.addCard);
router.get('/cards', auth, usuario_controller.getCards);
router.post('/pay', auth, usuario_controller.payAndAddBalance);
router.post('/', usuario_controller.createUser)
router.get('/:id/fondos', usuario_controller.getUserFundsById);

module.exports = router
