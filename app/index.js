const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const i18n = require("i18n");
const Helpers = require('./helpers');
const rememberLogin = require('./http/middleware/rememberLogin');
const methodOverride = require('method-override');
const gate = require('app/helpers/gate');

module.exports = class Application {
    constructor() {
        this.setupExpress();
        this.setMongoConnection();
        this.setConfig();
        this.setRouters();
    }

    setupExpress() {
        const server = http.createServer(app);
        server.listen(config.port, () => {
            console.log(`server run on port ${config.port}`); // run app with http
        });
    }

    setMongoConnection() { // set up mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(config.database.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    }

    setConfig() {
        require('./passport/passport-local'); // for call own passport strategy
        require('./passport/passport-google');// exactly like passport local for call google strategy
        require('./passport/passport-jwt');// this is for jwt auth with passport (API)
        app.use(express.static(config.layout.public_dir));
        app.set('view engine', config.layout.view_engine); //set up template engine
        app.set('views', config.layout.view_dir); // render ejs file in this directory
        app.use(config.layout.ejs.expressLayouts); // for using master page "express-ejs-layouts"
        app.set("layout extractScripts", config.layout.ejs.extract_scripts); // for using "script" in "express-ejs-layouts"
        app.set("layout extractStyles", config.layout.ejs.extract_styles);// for using "style" in "express-ejs-layouts"
        app.set("layout" , config.layout.ejs.master);
        app.use(bodyParser.urlencoded({ extended: false })); //set up body parser
        app.use(bodyParser.json()); //set up body parser
        app.use(methodOverride('_method')); // for send put and delete req from html from
        app.use(cookieParser(config.cookie_secretkey)); //set up cookie parser
        app.use(expressValidator()); //set up express validator expired
        app.use(session(config.session)); //set up express session
        app.use(flash()); //set up connect-flash
        app.use(passport.initialize()); // set up passport
        app.use(passport.session()); // setup passport for session
        app.use(rememberLogin.handle); // for using own middleware about rememberLogin
        app.use(gate.middleware()); // for use authorization in admin panel roles & permission
        i18n.configure({ // for config multi language
            locales:['en', 'fa'],
            directory: config.layout.i18n_directory,
            defaultLocale: 'en',
            // cookie: 'lang'
        });
        app.use(i18n.init);// for config multi language
        app.use((req , res , next) => { //define golobal varraible for ejs
            app.locals = new Helpers(req , res).getObjects();
            next();
        });
    }

    setRouters() {
        app.use(require('app/routes/api'));
        app.use(require('app/routes/web')); //call api and web routes
    }
}