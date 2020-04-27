const Controller = require('./../controller');
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = new class authController extends Controller {
    async login (req , res) {
        try {
            if(!await this.validationData(req , res)) return; // speacial for api

            passport.authenticate('local-login' , { session: false } , (err , user) => {
                if(err) return this.failed(res , err.message);
                if(!user) return this.failed(res , 'This user not exist' , 404);

                req.login(user , { session: false } , (err) => {
                    if(err) return this.failed(res , err.message);

                    //create token
                    const token = jwt.sign({ id: user.id } , config.jwt.secret_key , {
                        expiresIn: 60 * 60 * 24 * 120
                    });

                    res.json({
                        data: { token },
                        status: 'success'
                    });
                });
            })(req , res);
        } catch (err) {
            this.failed(res , err.message);
        }
    }
}
