const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy; // we use this startegy for eamil and pass auth
const User = require('app/models/user');

/*
this code for setup session with passport to every time we want login save in session
"just copy from site"
Start
*/

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) { // return user information
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/* end code*/

passport.use(new googleStrategy({
    clientID: config.service.google.site_key, // search google api to get this
    clientSecret: config.service.google.secret_key,
    callbackURL: config.service.google.callback_url
},(accessToken, refreshToken, profile, done) => {
    // console.log(accessToken, refreshToken, profile); for get how use this information

    User.findOne({ email : profile.emails[0].value } , (err , user) => { // htis do both login and register
        if(err) return done(err);
        if(user) return done(null , user); // user exist and after that login in website

        const newUser = new User({ // if user not exist register in site (new user)
            name: profile.displayName,
            email: profile.emails[0].value,
            password: profile.id
        });
        
        newUser.save(err => {
            if(err) throw err;
            done(null , newUser); //register and then login in website
        });
    });
}));

