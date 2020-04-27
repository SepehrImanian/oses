const Controller = require('../controller');
const Category = require('app/models/category');

module.exports = new class categoryController extends Controller {
    async index(req, res , next) { // next for error handeling
        try {
            let page = req.query.page || 1;
            let categories = await Category.paginate({} , { page , sort: { createdAt: -1 } , limit: 20 , populate: 'parent' }); // use pagination instead of find
            // return res.json(categories);
            res.render('admin/categories/index', {
                title: "Admin Categories",
                categories
            }); // render ejs file in /resource/views

        } catch (err) {
            next(err); // for pass this err to errorHandler middleware to show err
        }
    }

    async create(req , res , next) {
        try {
            let categories = await Category.find({ parent: null }); // return parent category

            res.render('admin/categories/create', {
                title: "Create Category",
                categories
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

            let { name , parent } = req.body;
            // create episode
            let newCategory = new Category({
                name,
                slug: this.slug(name),
                parent: parent !== 'none' ? parent : null
            });
            await newCategory.save();

            return res.redirect('/admin/categories');
        } catch (err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let category = await Category.findById(req.params.id).populate('childs').exec();

            if(!category) {
                this.error('This category not exist' , 404);
            }

            category.childs.forEach(category => category.remove());

            // delete category
            category.remove();

            return res.redirect('/admin/categories');
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
}