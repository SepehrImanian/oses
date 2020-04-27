const express = require('express');
const router = express.Router();

// Route Version 1
const apiv1 = require('./api-v1');
router.use('/api/v1' , apiv1);

module.exports = router;