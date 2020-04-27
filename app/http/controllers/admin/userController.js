const Controller = require('../controller');
const User = require('app/models/user');
const Role = require('app/models/role');

module.exports = new class userController extends Controller {
    async index(req, res , next) {
        try {
            let page = req.query.page || 1;
            let users = await User.paginate({} , { page , sort: { createdAt: -1 } , limit: 20 });
            res.render('admin/users/index', {
                title: "Admin Users",
                users
            });
        } catch (err) {
            next(err);
        }
    }

    async create(req , res , next) {
        try {
            res.render('admin/users/create', {
                title: "Create User",
            });
        } catch (err) {
            next(err);
        }
    }

    async addrole(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let user = await User.findById(req.params.id);
            let roles = await Role.find({});
            if(!user) {
                this.error('This user not exist' , 404);
            }
            
            res.render('admin/users/addrole', {
                title: "Add Role",
                user,
                roles
            });
        } catch (err) {
            next(err);
        }
    }

    async storeAddRole(req , res , next) { // put request => update user model with roles
        try {
            this.isMongoId(req.params.id);

            let user = await User.findById(req.params.id);
            if(!user) {
                this.error('This user not exist' , 404);
            }

            user.set({ roles: req.body.roles });
            await user.save();

            return res.redirect('/admin/users');
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

            let { name , email , password } = req.body;
            // create episode
            let newUser = new User({
                name,
                email,
                password
            });
            await newUser.save();

            return res.redirect('/admin/users');
        } catch (err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let user = await User.findById(req.params.id).populate({ path: 'courses' , populate: ['episodes'] });

            if(!user) {
                this.error('This user not exist' , 404);
            }

            // delete user courses and episodes
            user.courses.forEach(course => {
                course.episodes.forEach(episode => episode.remove());
                course.remove();
            });

            // delete user
            user.remove();

            return res.redirect('/admin/users');
        } catch (err) {
            next(err);
        }
    }

    async edit(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let category = await Category.findById(req.params.id);
            let categories = await Category.find({ parent: null });

            if(!category) {
                this.error('This category not exist' , 404);
            }

            return res.render('admin/categories/edit' , { category , categories });
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

            // update category
            let { name , parent } = req.body;
            await Category.findByIdAndUpdate(req.params.id , { $set: {
                name,
                slug: this.slug(name),
                parent: parent !== 'none' ? parent : null
            }});

            // redirect back
            return res.redirect('/admin/categories');
        } catch (err) {
            next(err);
        }
    }

    async toggleadmin(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            // for change admin to user , user to admin
            let user = await User.findById(req.params.id);
            user.set({ admin: ! user.admin});
            await user.save();

            return this.back(req , res);
        } catch (err) {
            next(err);
        }
    }
}