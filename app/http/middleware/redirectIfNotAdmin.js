const middleware = require('./middleware');

module.exports = new class redirectIfNotAdmin extends middleware {
    /*
       if someone not admin redirect to "/" page
    */
    handle(req, res, next) {
        if (req.isAuthenticated() && req.user.admin) {
            // "req.user.admin" means user admin or not (True,False) from admin property in user.js model
            return next();
        } else {
            return res.redirect('/');
        }

    }
}