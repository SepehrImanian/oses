const Controller = require('./controller');
const Course = require('app/models/course');
const Episode = require('app/models/episode');
const Category = require('app/models/category');
const Payment = require('app/models/payment');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const request_http = require('request-promise');

module.exports = new class courseController extends Controller {
    async index(req , res) {
        let query = {};

        // search something
        if(req.query.search) {
            query.title = new RegExp(req.query.search , 'gi'); // find somthing in text string (exist or not)
        }

        // filter "type" base on vip , free , cash , all
        if(req.query.type && req.query.type != 'all') {
            query.type = req.query.type;
        }

        // filter base on "category id" in field "categories" in course model
        if(req.query.category && req.query.category != 'all') {
            let category = await Category.findOne({ slug: req.query.category });
            if(category) {
                query.categories = { $in: [ category.id ] }
            }
        }

        // filter base on top codes
        let courses = Course.find({ ...query });

        // sort courses base on checkbocx => req.query.order
        if(req.query.order) {
            courses.sort({ createdAt: -1 });
        }

        // return sort courses to ejs file
        courses = await courses.exec();

        let categories = await Category.find({});

        res.render('home/courses' , { courses , categories });
    }

    async single(req , res) {
        let course = await Course
                        .findOneAndUpdate({ slug: req.params.course } , { $inc : { viewCount: 1 }})
                        .populate([
                            { path: 'user' , select: 'name' },
                            { path: 'episodes' , options: { sort: { number: 1 } } }
                        ])
                        .populate([{
                            path: 'comments',
                            match: {
                                parent: null,
                                approved: true
                            },
                            populate:[
                                { path: 'user' , select: 'name' } ,
                                { 
                                    path: 'comments',
                                    match: {
                                        parent: null,
                                        approved: true
                                    },
                                    populate: { path: 'user' , select: 'name' }
                                }
                            ]
                        }]); // for render comments in course
        
    
        let categories = await Category.find({ parent: null }).populate('childs').exec();
        // return res.json(course);

        res.render('home/single-course' , { course , categories });
    }

    async download(req , res , next) {
        try {
            this.isMongoId(req.params.episode);
            let episode = await Episode.findById(req.params.episode);

            if(!episode){
                this.error('This file not available 1' , 404);
            }

            // check "mac" varriable and "timestamps"
            if(!this.checkHash(req , episode)) {
                this.error('Link download expired' , 403);
            }

            let filePath = path.resolve(`./public/download/&87672%jhflshAHG&^!@&^5323cx;jddfjijhdjJJI/${episode.videoUrl}`); // full path

            if(!fs.existsSync(filePath)) {
                this.error('This file not available 2' , 403);
            }

            await episode.inc('downloadCount');

            return res.download(filePath); // download file with express

        } catch (err) {
            next(err);
        }
    }

    checkHash(req , episode) {
        // check time now with time we was set in episode model for next 12 hours in download method
        let timestamps = new Date().getTime();
        if(req.query.t < timestamps) return false;

        // compare hash with "mac" in query , we was hashed in episode model in download method
        let text = `@#$huogdas&^@yuigy*!@hud$#%1${episode.id}${req.query.t}`;
        return bcrypt.compareSync(text , req.query.mac);
    }

    async payment(req , res , next) {
        try {
            this.isMongoId(req.body.course);

            let course = await Course.findById(req.body.course);
            if(!course) {
                this.alert(req , {
                    title: 'Notice',
                    message: 'This course not found',
                    type: 'error',
                    button: 'OK'
                });
                return this.back(req , res);
            }

            if(req.user.checkLearning(course)) {
                this.alert(req , {
                    title: 'Notice',
                    message: 'You bought course before',
                    type: 'error',
                    button: 'OK'
                });
                return this.back(req , res);
            }

            if(course.price == 0 && (course.type == 'vip' || course.type == 'free')) {
                this.alert(req , {
                    title: 'Notice',
                    message: 'This course for free or vip , you cant buy it',
                    type: 'error',
                    button: 'OK'
                });
                return this.back(req , res);
            }

            // buy proccess
            let params = {
                MerchantID : 'my-zarin-pal-key',
                Amount: course.price,
                CallbackURL: 'http://localhost:3001/courses/payment/checker',
                Description: `For buy course ${course.title}`,
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
                            course: course.id,
                            resnumber: data.Authority, //unique number
                            price: course.price
                        });

                        await payment.save();
                        res.redirect(`https://www.zarinpal.com/pg/StartPay/${data.Authority}`);
                    })
                    .catch(err => res.json(err.message));
                    
        } catch (err) {
            next(err);
        }
    }

    async checker(req , res , next) {
        try {
            if(req.query.Status && req.query.Status !== 'OK') {
                return this.alertAndBack(req , res , {
                    title: 'Notice',
                    message: 'Your buy was not success'
                });
            }

            let payment = await Payment.findOne({ resnumber: req.query.Authority }).populate('course').exec();

            if(!payment.course) {
                return this.alertAndBack(req , res , {
                    title: 'Notice',
                    message: 'Your bought course not found',
                    type: 'error'
                });
            }

            // for check verification after payment
            let params = {
                MerchantID : 'my-zarin-pal-key',
                Amount: course.price,
                Authority: req.query.Authority
            }

            let options = this.getUrlOption('https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json' , params);

            request_http(options)
                .then(async data => {
                    if(data.Status == 100) {
                        // update field "paymrnt" in payment model
                        payment.set({ payment: true });
                        await payment.save();

                        // update field learning user
                        req.user.learning.push(payment.course.id);
                        await req.user.save();

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
                            message: 'Your buy was not success'
                        });
                    }
                })
                .catch(err => {
                    return this.alertAndBack(req , res , {
                        title: 'Notice',
                        message: 'Your buy was not success'
                    });
                });

        } catch (err) {
            next(err);
        }
    }
}