const express = require('express');
const router = express.Router();

// Admin router
const adminRouter = require('./admin');
router.use('/admin' , adminRouter);

// Home router
const homeRouter = require('./home');
router.use('/' , homeRouter);

// Middlewares
const redirectIfAuthenticated = require('app/http/middleware/redirectIfAuthenticated');

// Auth router
const authRouter = require('./auth');
router.use('/auth' , redirectIfAuthenticated.handle , authRouter);


module.exports = router;