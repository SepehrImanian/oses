const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controllers
const loginController = require('app/http/controllers/auth/loginController');
const registerController = require('app/http/controllers/auth/registerController');
const forgotPasswordController = require('app/http/controllers/auth/forgotPasswordController');
const resetPasswordController = require('app/http/controllers/auth/resetPasswordController');

// Validators
const registerValidator = require('app/http/validators/registerValidator'); // express-validtor new version
const loginValidator = require('app/http/validators/loginValidator');
const forgotPasswordValidator = require('app/http/validators/forgotPasswordValidator');
const resetPasswordValidator = require('app/http/validators/resetPasswordValidator');

// Home routes
router.get('/login' , loginController.showLoginForm);
router.post('/login' , loginValidator.handle() , loginController.loginProccess);
router.get('/register' , registerController.showRegisterForm);
router.post('/register' , registerValidator.handle() , registerController.registerProccess);
//its for send email for reset password
router.get('/password/reset' , forgotPasswordController.showForgotPassword);
router.post('/password/email' , forgotPasswordValidator.handle() , forgotPasswordController.sendPasswordResetLink);
//it's for reset password
router.get('/password/reset/:token' , resetPasswordController.showResetPassword);
router.post('/password/reset' , resetPasswordValidator.handle() , resetPasswordController.resetPasswordProccess);

router.get('/google' , passport.authenticate('google', { scope: ['profile' , 'email']})); //for auth own google strategy
router.get('/google/callback' , passport.authenticate('google', { // register strategy wiht google
    successRedirect: '/', // if it ok
    failureRedirect: '/auth/register' //if it is not ok
}));

module.exports = router;