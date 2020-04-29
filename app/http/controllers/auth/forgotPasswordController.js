const Controller = require('../controller');
const PasswordReset = require('app/models/password-reset');
const User = require('app/models/user');
const uniqueString = require('unique-string');
const mail = require('app/helpers/mail');

module.exports = new class forgotPasswordController extends Controller {
    showForgotPassword(req, res) {
        res.render('home/auth/passwords/email', {
            recaptcha: this.recaptcha.render(),
            title: "Forgot Password"
        }); // render ejs file in /resource/views
    }

    async sendPasswordResetLink(req, res) {
        await this.recaptchaValidation(req, res);
        let result = await this.validationData(req);
        if (result) {
            return this.sendResetLink(req , res);
        } else {
            return this.back(req , res);
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
        let info = await mail.sendMail({
            from: '"nine" <info@nine.com>',
            to: `${newPasswordReset.email}`,
            subject: "Reset Password",
            html: `
                <h2>Reset Password</h2>
                <p>For reset password click link</p>
                <a href="${config.host}/auth/password/reset/${newPasswordReset.token}">${config.host}/auth/password/reset/${newPasswordReset.token}</a>
            ` // html body
        });

        console.log("Message sent: %s", info.messageId);

        this.alert(req , {
            title: 'Notice',
            message: 'Reset password email send , check your email',
            type: 'success',
            button: 'OK'
        });

        // req.flash('success' , 'Email successfully send');
        return res.redirect('/');
    }
}