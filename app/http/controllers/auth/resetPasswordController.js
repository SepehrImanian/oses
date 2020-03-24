const Controller = require('../controller');
const PasswordReset = require('app/models/password-reset');
const User = require('app/models/user');

module.exports = new class resetPasswordController extends Controller {
    showResetPassword(req, res) {
        res.render('home/auth/passwords/reset', {
            messages: req.flash('errors'),
            recaptcha: this.recaptcha.render(),
            title: "Reset Password",
            token: req.params.token
        }); // render ejs file in /resource/views
    }

    async resetPasswordProccess(req, res) {
        // await this.recaptchaValidation(req, res);
        let result = await this.validationData(req);
        if (result) {
            return this.resetPassword(req , res);
        } else {
            return res.redirect('/auth/password/reset/' + req.body.token); // for redirect past route with token value also
        }
    }

    async resetPassword(req , res) {
        let field = await PasswordReset.findOne({ $and: [{ email: req.body.email },{ token: req.body.token }]});
        // both of them in one object email and token (hole model)
        if(!field) {
            req.flash('errors' , 'Not valid information');
            return this.back(req , res);
        }

        if (field.use) { // check "use" in PasswordReset model (is it used or not)
            req.flash('errors' , 'This link expired');
            return this.back(req , res);
        }

        let user = await User.findOneAndUpdate({email: field.email} , { $set: { password: req.body.password }}); // for update user password
        if (!user) {
            req.flash('errors' , 'Information not updated');
            return this.back(req , res);
        }

        await field.updateOne({ use: true }); // that means this link expire beacuse used one time
        return res.redirect('/auth/login');
    }
}