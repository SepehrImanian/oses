const Controller = require('../controller');
const PasswordReset = require('app/models/password-reset');
const User = require('app/models/user');
const uniqueString = require('unique-string');

module.exports = new class forgotPasswordController extends Controller {
    showForgotPassword(req, res) {
        res.render('home/auth/passwords/email', {
            messages: req.flash('errors'),
            recaptcha: this.recaptcha.render(),
            title: "Forgot Password"
        }); // render ejs file in /resource/views
    }

    async sendPasswordResetLink(req, res) {
        // await this.recaptchaValidation(req, res);
        let result = await this.validationData(req);
        if (result) {
            return this.sendResetLink(req , res);
        } else {
            return res.redirect('/auth/password/reset');
        }
    }

    async sendResetLink(req , res) {
        let user = await User.findOne({ email: req.body.email });
        if(!user) {
            req.flash('errors' , 'This user not exist');
            return this.back(req , res);
        }

        const newPasswordReset = new PasswordReset({
            email: req.body.email,
            token: uniqueString()
        });

        await newPasswordReset.save();

        // send mail
        // req.flash('success' , 'Email successfully send');
        res.redirect('/');
    }
}