const autoBind = require('auto-bind');
const { validationResult } = require('express-validator/check');

module.exports = class Controller {
    constructor() {
        autoBind(this);
    }

    failed(res , msg , statusCode = 500) {
        res.status(statusCode).json({
            data: msg,
            status: 'error' 
        });
    }

    async validationData(req , res) {
        let result = validationResult(req);
        if (!result.isEmpty()) {
            const errors = result.array();
            const messages = [];
            errors.forEach(err => messages.push(err.msg));
            this.failed(res , messages , 403);
            return false;
        }
        return true;
    }
}