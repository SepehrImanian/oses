const middleware = require('./middleware');

module.exports = new class activeUser extends middleware {
    handle(req, res, next) {
        if (req.isAuthenticated()) {
            // if not active user => logout user
            if(req.user.active) return next();

            this.alert(req , {
                title: 'Notice',
                message: 'Your accunt not active please login to send you email activation',
                type: 'error',
                button: 'OK'
            });

            // logout user
            req.logout();
            res.clearCookie('remember_token');
            res.redirect('/');
        }
        next();
    }
}