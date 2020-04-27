const path = require('path');
const autoBind = require('auto-bind');
const moment = require('moment');

module.exports = class Helpers {

    constructor(req , res) {
        autoBind(this);
        this.req = req;
        this.res = res;
        this.formData = this.req.flash('formData')[0]; // [0] beacuse req.flash it is array and we need obj
    }

    /*
    
    this about bottom method getObjects()

    {
        this.auth => get value from outside
        this.auth() => return value from inside to outside
    }

    */

    getObjects() { //return app.locals property
        return {
            auth: this.auth(),
            viewPath: this.viewPath,
            // viewPath this method for rendering err-message layout
            // "<%- include(viewPath('layouts/error-messages')) -%>" read "view_dir: path.resolve('./resource/views')" from layout config
            old: this.old,
            ...this.getGlobalVariables(),
            date: this.date,
            req: this.req
        }
    }

    auth() { //define golobal varraible for ejs (app.locals in app.use())
        return {
            user: this.req.user,
            check: this.req.isAuthenticated()
        }
    }

    viewPath(dir) {
        return path.resolve(config.layout.view_dir + '/' + dir);
    }

    getGlobalVariables() {
        return {
            messages: this.req.flash('errors') // instead using req.flash('errors') this in all Controllers
        }
    }

    old(field , defaultValue = '') {
        return this.formData && this.formData.hasOwnProperty(field) ? this.formData[field] : defaultValue;
        // hasOwnProperty() => just return field i need if exist or not (true , false)
    }

    date(time) {
        return moment(time);
    }
}