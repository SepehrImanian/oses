const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");
const cors = require('cors'); // set headers

// Api limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    // message: 'Too much requests in 15min',
    handler: function(req , res) {
        res.json({
            data: 'Too much requests in 15min',
            status: 'error'
        });
    }
});

// Route Version 1
const apiv1 = require('./api-v1');
router.use('/api/v1' , cors() , limiter , apiv1);

module.exports = router;