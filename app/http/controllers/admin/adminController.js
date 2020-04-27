const Controller = require('./../controller');

module.exports = new class adminController extends Controller {
    index(req, res) {
        res.render('admin/index', {
            // recaptcha: this.recaptcha.render(),
            title: "Admin Panel"
        }); // render ejs file in /resource/views
    }
    
    uploadImage(req, res) {
        /*
            for upload image in ckedior , this json for config of this
        */
        let image = req.file;
        res.json({
            "uploaded": 1,
            "fileName": image.originalname,
            "url": `${image.destination}/${image.filename}`.substring(8)
        });
    }
}