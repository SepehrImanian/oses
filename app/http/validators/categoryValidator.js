const validator = require('./validator');
const { check } = require('express-validator/check');
const Category = require('app/models/category');

module.exports = new class categoryValidator extends validator {
    handle() {
        return [            
            check('name')
                .not().isEmpty()
                .withMessage('title can not be empty')
                .isLength({ min: 3 })
                .withMessage('title can not be less than 3 char')
                .custom(async (value , { req }) => { // for create own custom validation (express validator)
                    if(req.query._method === 'put') { // when we want use this validation for both of create and edit (post , put)
                        let category = await Category.findById(req.params.id);
                        if(category.slug === value) return; // stop and skip this validation
                    }
                    let category = await Category.findOne({ slug: this.slug(value) });
                    if(category) {
                        throw new Error('This category exist before'); // if this category exist before show err in page (check with name)
                    }
                }),

            check('parent')
                .not().isEmpty()
                .withMessage('parent category can not be empty'),
        ];
    }

    slug(title) {
        return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g , "-"); // for add "-" between title for better CEO
    } // this method exist in courseController too , this time for validate
}