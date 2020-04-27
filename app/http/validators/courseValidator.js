const validator = require('./validator');
const { check } = require('express-validator/check');
const Course = require('app/models/course');
const path = require('path');

module.exports = new class courseValidator extends validator {
    handle() {
        return [            
            check('title')
                .not().isEmpty()
                .withMessage('title can not be empty')
                .isLength({ min: 5 })
                .withMessage('title can not be less than 5 char')
                .custom(async (value , { req }) => { // for create own custom validation (express validator)
                    if(req.query._method === 'put') { // when we want use this validation for both of create and edit (post , put)
                        let course = await Course.findById(req.params.id);
                        if(course.title === value) return; // stop and skip this validation
                    }
                    let course = await Course.findOne({ slug: this.slug(value) });
                    if(course) {
                        throw new Error('This course exist before'); // if this course exist before show err in page (check with title)
                    }
                }),
            
            check('images') // req.body.images check
                .custom(async (value , { req }) => {
                    if(req.query._method === 'put' && value === undefined) return; // when we want use this validation for both of create and edit (post , put)

                    if(!value) {
                        throw new Error('You have to send image for course');
                    }
                    let filex = ['.png' , '.jpg' , '.jpeg' , '.svg'];
                    if(! filex.includes(path.extname(value))) { // for check extname in images
                        throw new Error('Wrong extname');
                    }
                }),

            check('type')
                .not().isEmpty()
                .withMessage('type can not be empty'),
            
            check('body')
                .not().isEmpty()
                .withMessage('body can not be empty')
                .isLength({ min: 20 })
                .withMessage('body can not be less than 20 char'),
                
            check('price')
                .not().isEmpty()
                .withMessage('price can not be empty'),

            check('tags')
                .not().isEmpty()
                .withMessage('tags can not be empty'),
        ];
    }

    slug(title) {
        return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g , "-"); // for add "-" between title for better CEO
    } // this method exist in courseController too , this time for validate
}