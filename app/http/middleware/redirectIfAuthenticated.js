const middleware = require('./middleware');

module.exports = new class redirectIfAuthenticated extends middleware {
    /*
       if someone not login in site dont access to this route with middleware
    */
    handle(req, res, next) {
        if (req.isAuthenticated()) return res.redirect('/');
        next();
    }
}