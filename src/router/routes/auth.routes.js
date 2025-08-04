const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/validation', auth, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
