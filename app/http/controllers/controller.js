const autoBind = require('auto-bind');
const Recaptcha = require('express-recaptcha').Recaptcha; // import google recaptcha
const { validationResult } = require('express-validator/check');

module.exports = class Controller {
    constructor() {
        autoBind(this);
        this.recaptchaConfig();
    }

    recaptchaConfig() {
        this.recaptcha = new Recaptcha(
            config.service.recaptcha.site_key,
            config.service.recaptcha.secret_key
        ); // add these keys from google recaptcha site
    }

    recaptchaValidation(req , res) {
        return new Promise((resolve , reject) => {
            this.recaptcha.verify(req, (err, data) => {
                if (err) {
                    req.flash('errors' , 'please check the box');
                    this.back(req, res); //redirect past route
                } else {
                    resolve(true);
                }
            });
        });
    }

    async validationData(req) { // express validator for req.body
        let result = validationResult(req); 
        if (!result.isEmpty()) { // express validator if it has result or not
            const errors = result.array();
            const messages = [];
            errors.forEach(err => messages.push(err.msg));
            req.flash('errors', messages);
            return false;
        }
        return true;
    }

    back(req, res) { // for back to the past route
        return res.redirect(req.header('Referer') || '/');
    }
}