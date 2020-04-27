const Controller = require('./../controller');
const passport = require('passport');

module.exports = new class registerController extends Controller {
    showRegisterForm(req, res) {
        res.render('home/auth/register', {
            recaptcha: this.recaptcha.render(),
            title: "Register"
        }); // render ejs file in /resource/views
    } //send flash message data means express validator errors , send them to ejs in this directory
    //render google recaptcha with render() and send it to ejs template

    async registerProccess(req, res, next) {
        // await this.recaptchaValidation(req, res);
        let result = await this.validationData(req);
        if (result) {
            return this.register(req, res, next);
        } else {
            return this.back(req , res);
        }
    }

    register(req, res, next) {
        passport.authenticate('local-register', { // register strategy
            successRedirect: '/', // if it ok
            failureRedirect: '/auth/register', //if it is not ok
            failureFlash: true // if want send information with flash message
        })(req, res, next); //using own passport strategy auth , we had created in passport-local.js
    }
}