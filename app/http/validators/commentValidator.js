const validator = require('./validator');
const { check } = require('express-validator/check');

module.exports = new class commentValidator extends validator {
    handle() {
        return [
            check('comment')
                .not().isEmpty()
                .withMessage('comment can not be empty')
                .isLength({ min: 10 })
                .withMessage('comment can not be less than 10 char'),
        ];
    }
}