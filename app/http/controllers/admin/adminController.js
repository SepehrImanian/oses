const Controller = require('./../controller');

module.exports = new class adminController extends Controller {
    index(req , res) {
        res.json('admin page');
    }
}