const middleware = require('./middleware');

module.exports = new class convertFileToField extends middleware {
    /*
        beacuse when uploaded image with multer "images" property delete in req.body and
        just we access in req.file => for solve express validation err
    */
    handle(req, res, next) {
        if (!req.file) {
            req.body.images = undefined; // if not file exist delete "images" property in req.body 
        } else {
            req.body.images = req.file.filename; // if file exist add "images" property in req.body from req.file.originalname
        }
        next();
    }
}