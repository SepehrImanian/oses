const middleware = require('./middleware');
const passport = require('passport');

module.exports = new class authApi extends middleware {
    /*
       info => err meassage we use in passport-jwt in jwt strategy
       this middleware for access to private route
       session: false => beacuse of using api not web
    */
    handle(req, res, next) {
        passport.authenticate('jwt' , { session: false } , (err , user , info) => {

            if(err || !user) {
                return res.status(401).json({
                    data: info.message || 'You dont have access',
                    status: 'error'
                });
            }

            req.user = user;
            next();
        })(req , res , next); 
    }
}