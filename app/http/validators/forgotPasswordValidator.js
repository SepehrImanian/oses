const validator = require('./validator');
const { check } = require('express-validator/check');

module.exports = new class forgotPasswordValidator extends validator {
    handle() {
        return [            
            check('email')
                .not().isEmpty()
                .withMessage('email can not be empty')
                .isEmail()
                .withMessage('it is not email')
        ];
    }
}