const autoBind = require('auto-bind');

module.exports = class Validator {
    constructor() {
        autoBind(this);
    }
}