const validator = require('./validator');
const { check } = require('express-validator/check');
const Permission = require('app/models/permission');

module.exports = new class permissionValidator extends validator {
    handle() {
        return [            
            check('name')
                .not().isEmpty()
                .withMessage('title can not be empty')
                .isLength({ min: 3 })
                .withMessage('title can not be less than 3 char')
                .custom(async (value , { req }) => { // for create own custom validation (express validator)
                    if(req.query._method === 'put') { // when we want use this validation for both of create and edit (post , put)
                        let permission = await Permission.findById(req.params.id);
                        if(permission.name === value) return; // stop and skip this validation
                    }
                    let permission = await Permission.findOne({ name: value });
                    if(permission) {
                        throw new Error('This permission exist before'); // if this category exist before show err in page (check with name)
                    }
                }),

            check('label')
                .not().isEmpty()
                .withMessage('label can not be empty'),
        ];
    }
}