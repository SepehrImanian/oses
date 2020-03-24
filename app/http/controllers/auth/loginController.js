const Controller = require('./../controller');
const passport = require('passport');

module.exports = new class loginController extends Controller {
    showLoginForm(req, res) {
        res.render('home/auth/login', {
            messages: req.flash('errors'),
            recaptcha: this.recaptcha.render(),
            title: "Login"
        }); // render ejs file in /resource/views
    }

    async loginProccess(req, res, next) { //next for using passport
        // await this.recaptchaValidation(req, res);
        let result = await this.validationData(req);
        if (result) {
            return this.login(req, res, next);
        } else {
           return res.redirect('/auth/login'); 
        }
    }

    login(req, res, next) {
        passport.authenticate('local-login', (err, user) => {
            if (!user) return res.redirect('/auth/login');
            if (err) console.log(err);

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