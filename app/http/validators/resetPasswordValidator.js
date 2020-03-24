const validator = require('./validator');
const { check } = require('express-validator/check');

module.exports = new class resetPasswordValidator extends validator {
    handle() {
        return [            
            check('email')
                .not().isEmpty()
                .withMessage('email can not be empty')
                .isEmail()
                .withMessage('it is not email'),
                
            check('token')
                .not().isEmpty()
                .withMessage("Token can not be empty"),

            check('password')
                .not().isEmpty()
                .withMessage('password can not be empty')
                .isLength({ min: 8 })
                .withMessage('password can not be less than 8 char')
        ];
    }
}