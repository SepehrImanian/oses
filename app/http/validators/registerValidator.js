const validator = require('./validator');
const { check } = require('express-validator/check');

module.exports = new class registerValidator extends validator {
    handle() {
        return [
            check('name')
                .not().isEmpty()
                .withMessage('name can not be empty')
                .isLength({ min: 3 })
                .withMessage('name can not be less than 3 char'),
            
            check('email')
                .not().isEmpty()
                .withMessage('email can not be empty')
                .isEmail()
                .withMessage('it is not email'),
                
            check('password')
                .not().isEmpty()
                .withMessage('password can not be empty')
                .isLength({ min: 8 })
                .withMessage('password can not be less than 8 char'),
        ];
    }
}