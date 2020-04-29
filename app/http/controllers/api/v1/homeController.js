const Controller = require('../controller');
const Payment = require('app/models/payment');

module.exports = new class homeController extends Controller {
    async user (req , res) {
        try {
            let user = await req.user.populate({ path: 'roles' , populate: [{ path: 'permissions' }]}).execPopulate();
            res.json({
                data: this.filterUserData(user),
                status: 'success'
            });
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
    
    // filter and transform data for send to user
    filterUserData(user) { 
        return {
            id: user.id,
            admin: user.admin,
            name: user.name,
            email: user.email,
            roles: user.roles.map(role => {
                return {
                    name: role.name,
                    label: role.label,
                    permissions: role.permissions.map(permission => {
                        return {
                            name: permission.name,
                            label: permission.label,
                        }
                    })
                }
            })
        }
    }
}
