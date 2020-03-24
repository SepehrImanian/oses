const User = require('app/models/user');
const middleware = require('./middleware');

module.exports = new class rememberLogin extends middleware {
    /*
        sometimes coookie "remember_token" exist and user not login in site => create this middleware
        "remember_token" = own cookie define it after tick checkbox
    */

    handle(req, res, next) {
        if (!req.isAuthenticated()) {
            const rememberToken = req.signedCookies.remember_token; // get hash value of cookie , we was define
            if (rememberToken) return this.userFind(req, rememberToken, next);
        }
        next();
    }

    userFind(req, rememberToken, next) {
        User.findOne({ rememberToken }) // find user and login in site, if cookie ("remember_token") exist
            .then(user => {
                if (user) { // if user not exist but cookie exist (bug)
                    req.logIn(user, err => {
                        if (err) next(err);
                        next();
                    });
                } else {
                    next(); 
                }
            })
            .catch(err => next(err));
    }
}