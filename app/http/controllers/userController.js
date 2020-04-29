const Controller = require('./controller');
const Payment = require('app/models/payment');
const request_http = require('request-promise');
const ActivationCode = require('app/models/activationCode');

module.exports = new class userController extends Controller {
    async index(req , res , next) {
        try {
            res.render('home/panel/index' , { title: 'User Panel' });
        } catch (err) {
            next(err);
        }
    }

    async history(req , res , next) {
        try {
            // user: req.user.id => for find user login now
            let page = req.query.page || 1;
            let payments = await Payment.paginate({ user: req.user.id } , { page , sort: { createdAt: -1 } , limit: 20 , populate: 'course' });
            res.render('home/panel/history' , { title: 'User History' , payments });
        } catch (err) {
            next(err);
        }
    }

    async vip(req , res , next) {
        try {
            res.render('home/panel/vip' , { title: 'Vip Panel' });
        } catch (err) {
            next(err);
        }
    }

    async vipPayment(req , res , next) {
        try {
            let plan = req.body.plan,
                price = 0;
            
            switch (plan) {
                case "3":
                    price = 30000;    
                break;
                case "12":
                    price = 120000;    
                break;
                default:
                    price = 10000;
                break;
            }

            // buy proccess
            let params = {
                MerchantID : 'my-zarin-pal-key',
                Amount: price,
                CallbackURL: 'http://localhost:3001/user/panel/vip/payment/checker',
                Description: 'For vip member',
                Email: req.user.email
            }

            // send post request to this url and with params
            let options = this.getUrlOption('https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json' , params);

            /*
                first send post request => https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json
                second revice res from server and get method (redirect) => `https://www.zarinpal.com/pg/StartPay/${data.Authority}`
                (Authority => special unique number return form zarinpal server)
            */

            request_http(options)
                    .then(async data => {
                        // save data payment before go to the payment zarinpal site
                        let payment = new Payment({
                            user: req.user.id,
                            vip: true,
                            resnumber: data.Authority, //unique number
                            price: price
                        });

                        await payment.save();
                        res.redirect(`https://www.zarinpal.com/pg/StartPay/${data.Authority}`);
                    })
                    .catch(err => res.json(err.message));
        } catch (err) {
            next(err);
        }
    }

    async vipChecker(req , res , next) {
        try {
            if(req.query.Status && req.query.Status !== 'OK') {
                return this.alertAndBack(req , res , {
                    title: 'Notice',
                    message: 'Your buy was not success'
                });
            }

            let payment = await Payment.findOne({ resnumber: req.query.Authority });

            if(!payment.vip) {
                return this.alertAndBack(req , res , {
                    title: 'Notice',
                    message: 'This payment not related to vip',
                    type: 'error'
                });
            }

            // for check verification after payment
            let params = {
                MerchantID : 'my-zarin-pal-key',
                Amount: payment.price,
                Authority: req.query.Authority
            }

            let options = this.getUrlOption('https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json' , params);

            request_http(options)
                .then(async data => {
                    if(data.Status == 100) {

                        let time = 0,
                            type = '';

                        switch (payment.price) {
                            case 10000:
                                time = 1;
                                type = 'month';
                            break;
                            case 30000:
                                time = 3;
                                type = '3month';
                            break;
                            case 120000:
                                time = 12;
                                type = '12month';
                            break;
                        }

                        if(time == 0) {
                            this.alert(req , {
                                title: 'Notice',
                                message: 'Your buy was not success',
                                type: 'error'
                            });
                            return res.redirect('/user/panel/vip');
                        }

                        // add time with month of vipTime in user model
                        let vipTime = req.user.isVip() ? new Date(req.user.vipTime) : new Date();
                        vipTime.setMonth(vipTime.getMonth() + time);

                        // update time and type user
                        req.user.set({vipTime , vipType: type});
                        await req.user.save();

                        // update field "paymrnt" in payment model
                        payment.set({ payment: true });
                        await payment.save();

                        this.alert(req , {
                            title: 'Thanks',
                            message: 'Success',
                            type: 'success',
                            button: 'OK'
                        });

                        res.redirect(payment.course.path());

                    } else {
                        return this.alertAndBack(req , res , {
                            title: 'Notice',
                            message: 'Your buy was not success',
                            type: 'error'
                        });
                    }
                })
                .catch(err => {
                    return this.alertAndBack(req , res , {
                        title: 'Notice',
                        message: 'Your buy was not success',
                        type: 'error'
                    });
                });
        } catch (err) {
            next(err);
        }
    }

    async activation(req , res , next) {
        try {
            let activationCode = await ActivationCode
                                                .findOne({ token: req.params.token })
                                                .gt('expire' , new Date()) // "expire" more than "new Date()"
                                                .populate('user')
                                                .exec();
            if(!activationCode) {
                this.alert(req , {
                    title: 'Notice',
                    message: 'This link expired , please login again',
                    type: 'error',
                    button: 'OK'
                });
                return res.redirect('/');
            }

            if(activationCode.used) {
                this.alert(req , {
                    title: 'Notice',
                    message: 'This link used before , please login again for generate new one',
                    type: 'error',
                    button: 'OK'
                });
                return res.redirect('/');
            }

            // update user "active" field and update "used" field in activationCode model
            let user = activationCode.user;
            user.$set({ active: true });
            activationCode.$set({ used: true});

            await user.save();
            await activationCode.save();

            // login in website
            req.logIn(user, err => {
                if (err) console.log(err);
                user.setRememberToken(res);
                this.alert(req , {
                    title: 'Notice',
                    message: 'Your account activated',
                    type: 'success'
                });
                return res.redirect('/');
            });

        } catch (err) {
            next(err);
        }
    }
}