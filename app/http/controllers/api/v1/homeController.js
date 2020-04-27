const Controller = require('../controller');
const Payment = require('app/models/payment');

module.exports = new class homeController extends Controller {
    async user (req , res) {
        try {
            return res.json(req.user);
        } catch (err) {
            this.failed(res , err.message);
        }
    }

    async history(req , res) {
        try {
            // user: req.user.id => for find user login now
            let page = req.query.page || 1;
            let payments = await Payment.paginate({ user: req.user.id } , { page , sort: { createdAt: -1 } , limit: 20 , populate: 'course' });
            
            res.json({
                data: payments,
                status: 'success'
            });
        } catch (err) {
            this.failed(res , err.message);
        }
    }
}
