const Controller = require('./controller');

module.exports = new class homeController extends Controller {
    index(req , res) {
        res.render('home/index'); // render ejs file in /resource/views
        /* 
        passport save user information in req.user
        and also save in session,
        seesion save in mongodb beacuse of that always login after that
        res.json(req.user);
        */
    }
}