const express = require('express');
const router = express.Router();

const userRoutes = require('../modules/accommodation/routes')

router.use('/accommodation', userRoutes);

module.exports = router;