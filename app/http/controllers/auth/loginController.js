const Controller = require('./../controller');
const passport = require('passport');
const ActivationCode = require('app/models/activationCode');
const uniqueString = require('unique-string');
const mail = require('app/helpers/mail');

module.exports = new class loginController extends Controller {
    showLoginForm(req, res) {
        res.render('home/auth/login', {
            recaptcha: this.recaptcha.render(),
            title: "Login"
        }); // render ejs file in /resource/views
    }

    async loginProccess(req, res, next) { //next for using passport
        await this.recaptchaValidation(req, res);
        let result = await this.validationData(req);
        if (result) {
            return this.login(req, res, next);
        } else {
            return this.back(req , res); 
        }
    }

    async login(req, res, next) {
        passport.authenticate('local-login', async (err, user) => {
            if (!user) return res.redirect('/auth/login');
            if (err) console.log(err);

            // for user active
            if(!user.active) {
                let activationCode = await ActivationCode
                                                .find({ user: user.id })
                                                .gt('expire' , new Date()) // "expire" more than "new Date()"
                                                .sort({ createdAt: 1 })
                                                .populate('user')
                                                .limit(1)
                                                .exec();

                if(activationCode.length) {
                    return this.alertAndBack(req , res , {
                        title: 'Notice',
                        message: 'After 10 min last activation, try again',
                        type: 'error'
                    });
                } else {
                    // save Activation Code
                    let newActivationCode = new ActivationCode({
                        user: user.id,
                        token: uniqueString(),
                        expire: Date.now() + 1000 * 60 * 10 // 10 min future
                    });
                    await newActivationCode.save();

                    // send mail
                    let info = await mail.sendMail({
                        from: '"nine" <info@nine.com>',
                        to: `${user.email}`,
                        subject: "Activation Account",
                        html: `
                            <h2>Activation Account</h2>
                            <p>For Activation Account click link</p>
                            <a href="${config.host}/user/activation/${newActivationCode.token}">${config.host}/user/activation/${newActivationCode.token}</a>
                            `
                    });

                    console.log("Message sent: %s", info.messageId);

                    this.alert(req , {
                        title: 'Notice',
                        message: 'Your account activation send to you eamil , please check it',
                        type: 'success',
                        button: 'OK'
                    });
            
                    // req.flash('success' , 'Email successfully send');
                    return res.redirect('/');
                }
            }

            req.logIn(user, err => { //for login and set checkbox "remember me"
                if (err) console.log(err);
                if (req.body.remember) { // this is "name" was set in ejs form file
                    //set token in user model (rememberToken praperty)
                    user.setRememberToken(res); // this is function in user.js model to set cookie
                }
                return res.redirect('/');
            });

        })(req, res, next); //using own passport strategy auth , we had created in passport-local.js
    }
}


/*
passport.authenticate('local-login' , { // login strategy
    successRedirect: '/', // if it ok
    failureRedirect: '/login', //if it is not ok
    failureFlash: true // if want send information with flash message
})(req, res, next); //using own passport strategy auth , we had created in passport-local.js

"using this for past one login() method"
*/