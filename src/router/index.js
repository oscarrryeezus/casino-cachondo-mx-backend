const express = require("express");
const router = express.Router();
let cors = require("cors");
const bodyparser = require("body-parser");
router.use(express.json());
router.use(cors());
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

module.exports = router;