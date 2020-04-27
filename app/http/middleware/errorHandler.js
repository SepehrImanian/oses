const middleware = require('./middleware');

module.exports = new class errorHandler extends middleware {
    
    /*
       for pass errors another route to this middleware for handeling errors
    */

    async error404(req, res, next) {
        try {
            throw new Error('This page not found 404');
        } catch (err) {
            next(err); // pass errors to next middleware
        }
    }

    /*
        for handeling errors this last middleware and last route for collecting all
        routes and middleware before beacuse of that we dont use next() for last one
    */

    async handler(err , req , res , next) { // for render ejs speacial for errors
        const statusCode = err.status || 500;
        const message = err.message || ''; // just message
        const stack = err.stack || ''; // all of errs detail

        const layouts = { // beacuse it is middleware we can set up layout ejs
            layout: 'errors/master',
            extractScripts: false,
            extractStyles: false
        }

        if(config.debug) {
            return res.render('errors/stack' , { ...layouts , message , stack }); 
        }

        return res.render(`errors/${statusCode}` , { ...layouts , message , stack });
    }
}