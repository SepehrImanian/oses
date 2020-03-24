const passport = require('passport');
const localStrategy = require('passport-local').Strategy; // we use this startegy for eamil and pass auth
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


// create own strategy with passport local

passport.use('local-register' , new localStrategy({
    usernameField: 'email', // use email and password auth
    passwordField: 'password',
    passReqToCallback: true, // for sending request to next field
} , (req , email , password , done) => {
    User.findOne({ 'email' : email } , (err , user) => {
        if(err) return done(err);
        if(user) return done(null , false , req.flash('errors' , 'this user exist'));
        //if user not exist save in db
        const newUser = new User({
            name: req.body.name,
            email,
            password
        });
        newUser.save(err => {
            if (err) return done(null , false , req.flash('errors' , 'not succeess register , try again'));
            // null = dont have err  , false = not still user login
            done(null , newUser);
        });
    });
}));


passport.use('local-login' , new localStrategy({
    usernameField: 'email', // use email and password auth
    passwordField: 'password',
    passReqToCallback: true, // for sending request to next field
} , (req , email , password , done) => {
    User.findOne({ 'email' : email } , (err , user) => {
        if(err) return done(err);
        
        // if user not exist (check it with email)
        //for call method in models/user.js file
        if(!user || !user.comparePass(password)) {
            return done(null , false , req.flash('errors' , 'information not ture'));
        }

        done(null , user);
    });
}));