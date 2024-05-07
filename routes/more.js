const path = require('path');

const express = require('express');

const moreController = require('../controllers/more');

const router = express.Router();

router.get('/about', moreController.getAbout);

router.get('/contact', moreController.getContact);

module.exports = router;
