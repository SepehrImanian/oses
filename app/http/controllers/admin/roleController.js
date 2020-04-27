const Controller = require('../controller');
const Permission = require('app/models/permission');
const Role = require('app/models/role');

module.exports = new class roleController extends Controller {
    async index(req, res , next) { // next for error handeling
        try {
            let page = req.query.page || 1;
            let roles = await Role.paginate({} , { page , sort: { createdAt: -1 } , limit: 20 });
            res.render('admin/roles/index', {
                title: "Admin Roles",
                roles
            });

        } catch (err) {
            next(err);
        }
    }

    async create(req , res , next) {
        try {
            let permissions = await Permission.find({});
            res.render('admin/roles/create', {
                title: "Create Roles",
                permissions
            });
        } catch (err) {
            next(err);
        }
    }

    async store(req, res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                return this.back(req, res);
            }

            let { name , label , permissions } = req.body;
            // create permission
            let newRole = new Role({
                name,
                label,
                permissions
            });
            await newRole.save();

            return res.redirect('/admin/users/roles');
        } catch (err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let role = await Role.findById(req.params.id);

            if(!role) {
                this.error('This role not exist' , 404);
            }

            // delete role
            role.remove();

            return res.redirect('/admin/users/roles');
        } catch (err) {
            next(err);
        }
    }

    async edit(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let role = await Role.findById(req.params.id);
            let permissions = await Permission.find({});

            if(!role) {
                this.error('This role not exist' , 404);
            }

            return res.render('admin/roles/edit' , { role , permissions });
        } catch (err) {
            next(err);
        }
    }

    async update(req , res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                return this.back(req, res);
            }

            // update permission
            let { name , label , permissions } = req.body;
            await Role.findByIdAndUpdate(req.params.id , { $set: {
                name,
                label,
                permissions
            }});

            // redirect back
            return res.redirect('/admin/users/roles');
        } catch (err) {
            next(err);
        }
    }
}