const validator = require('./validator');
const { check } = require('express-validator/check');
const Role = require('app/models/role');

module.exports = new class roleValidator extends validator {
    handle() {
        return [            
            check('name')
                .not().isEmpty()
                .withMessage('title can not be empty')
                .isLength({ min: 3 })
                .withMessage('title can not be less than 3 char')
                .custom(async (value , { req }) => { // for create own custom validation (express validator)
                    if(req.query._method === 'put') { // when we want use this validation for both of create and edit (post , put)
                        let role = await Role.findById(req.params.id);
                        if(role.name === value) return; // stop and skip this validation
                    }
                    let role = await Role.findOne({ name: value });
                    if(role) {
                        throw new Error('This role exist before'); // if this category exist before show err in page (check with name)
                    }
                }),

            check('label')
                .not().isEmpty()
                .withMessage('label can not be empty'),
            
            check('permissions')
                .not().isEmpty()
                .withMessage('permissions can not be empty'),
        ];
    }
}