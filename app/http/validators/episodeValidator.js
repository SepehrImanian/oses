const validator = require('./validator');
const { check } = require('express-validator/check');

module.exports = new class episodeValidator extends validator {
    handle() {
        return [            
            check('title')
                .not().isEmpty()
                .withMessage('title can not be empty')
                .isLength({ min: 5 })
                .withMessage('title can not be less than 5 char'),

            check('type')
                .not().isEmpty()
                .withMessage('type can not be empty'),

            check('course')
                .not().isEmpty()
                .withMessage('course can not be empty'),
            
            check('body')
                .not().isEmpty()
                .withMessage('body can not be empty')
                .isLength({ min: 20 })
                .withMessage('body can not be less than 20 char'),
                
            check('videoUrl')
                .not().isEmpty()
                .withMessage('videoUrl can not be empty'),

            check('number')
                .not().isEmpty()
                .withMessage('number can not be empty'),
        ];
    }
}