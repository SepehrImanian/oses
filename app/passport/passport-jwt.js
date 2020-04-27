const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require('app/models/user');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

// check token created in jwt login
passport.use('jwt' , new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromUrlQueryParameter('api_token') // with query "api_token"
    ]),
    secretOrKey: config.jwt.secret_key
} , async (jwtPayload , done) => {
    try {
        let user = await User.findById(jwtPayload.id);

        if(user) {
            done(null , user);
        } else {
            done(null , false , { message: 'You dont have access to this link' });
        }

    } catch (err) {
        done(null , false , { message: err.message });
    }
}));