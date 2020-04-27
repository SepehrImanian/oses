const Controller = require('../controller');
const Permission = require('app/models/permission');

module.exports = new class permissionController extends Controller {
    async index(req, res , next) { // next for error handeling
        try {
            let page = req.query.page || 1;
            let permissions = await Permission.paginate({} , { page , sort: { createdAt: -1 } , limit: 20 });
            // return res.json(categories);
            res.render('admin/permissions/index', {
                title: "Admin Permissions",
                permissions
            }); // render ejs file in /resource/views

        } catch (err) {
            next(err); // for pass this err to errorHandler middleware to show err
        }
    }

    async create(req , res , next) {
        try {
            res.render('admin/permissions/create', {
                title: "Create Permission"
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

            let { name , label } = req.body;
            // create permission
            let newPermission = new Permission({
                name,
                label
            });
            await newPermission.save();

            return res.redirect('/admin/users/permissions');
        } catch (err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let permission = await Permission.findById(req.params.id);

            if(!permission) {
                this.error('This permission not exist' , 404);
            }

            // delete category
            permission.remove();

            return res.redirect('/admin/users/permissions');
        } catch (err) {
            next(err);
        }
    }

    async edit(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let permission = await Permission.findById(req.params.id);

            if(!permission) {
                this.error('This permission not exist' , 404);
            }

            return res.render('admin/permissions/edit' , { permission });
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
            let { name , label } = req.body;
            await Permission.findByIdAndUpdate(req.params.id , { $set: {
                name,
                label
            }});

            // redirect back
            return res.redirect('/admin/users/permissions');
        } catch (err) {
            next(err);
        }
    }
}