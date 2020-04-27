const express = require('express');
const router = express.Router();

// Controllers
const forEveryOne = require('./public');
const forUser = require('./private');

// Middlewares
const authApi = require('app/http/middleware/authApi');

router.use(forEveryOne); // for every one
router.use(authApi.handle , forUser); // for users

module.exports = router;