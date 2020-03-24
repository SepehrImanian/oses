module.exports = class Helpers {

    constructor(req , res) {
        this.req = req;
        this.res = res;
    }

    getObjects() { //return app.locals property
        return {
            auth: this.auth()
        }
    }

    auth() { //define golobal varraible for ejs (app.locals in app.use())
        return {
            user: this.req.user,
            check: this.req.isAuthenticated()
        }
    }
}