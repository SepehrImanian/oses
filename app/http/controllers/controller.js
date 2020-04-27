const autoBind = require('auto-bind');
const Recaptcha = require('express-recaptcha').Recaptcha; // import google recaptcha
const { validationResult } = require('express-validator/check');
const isMongoId = require('validator/lib/isMongoId');
const { sprintf } = require('sprintf-js');

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

    recaptchaValidation(req, res) {
        return new Promise((resolve, reject) => {
            this.recaptcha.verify(req, (err, data) => {
                if (err) {
                    req.flash('errors', 'please check the box');
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
        req.flash('formData', req.body);
        return res.redirect(req.header('Referer') || '/');
    }

    isMongoId(paramid) {
        if (!isMongoId(paramid)) {
            let err = new Error('This id is not valid');
            this.error('This id is not valid', 404);
        }
    }

    error(message, status = 500) {
        let err = new Error(message);
        err.status = status;
        throw err;
    }


    getTime(episodes) { // for using in episodeController for calculate sum of all episodes
        let second = 0;
        episodes.forEach(episode => {
            let time = episode.time.split(":");
            if (time.length === 2) {
                second += parseInt(time[0]) * 60;
                second += parseInt(time[1]);
            } else if (time.length === 3) {
                second += parseInt(time[0]) * 3600;
                second += parseInt(time[1]) * 60;
                second += parseInt(time[2]);
            }
        });

        let minutes = Math.floor(second / 60);
        let hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
        second = Math.floor(((second / 60) % 1) * 60);

        return sprintf('%02d:%02d:%02d', hours, minutes, second);
    }

    slug(title) {
        return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g , "-"); // for add "-" between title for better CEO
    }


    // This is render config of sweet alert for master page
    alert(req , data) {
        let title = data.title || '',
            message = data.message || '',
            type = data.type || 'info',
            button = data.button || null,
            timer = data.timer || 2000;

        req.flash('sweetalert' , { title , message , type , button , timer });
    }

    alertAndBack(req , res , data) {
        this.alert(req , data);
        this.back(req , res);
    }

    // send post request
    getUrlOption(url , params) {
        return {
            method: 'POST',
            uri: url,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json'
            },
            body: params,
            json: true
        }
    }
}