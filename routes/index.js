const express = require('express');
const router = express.Router();

const accommodationRoutes = require('../modules/accommodation/routes')

router.use('/accommodation', accommodationRoutes);

module.exports = router;