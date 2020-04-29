const express = require('express');
const router = express.Router();

// Controllers
const homeController = require('app/http/controllers/homeController');
const courseController = require('app/http/controllers/courseController');
const userController = require('app/http/controllers/userController');

// Validators
const commentValidator = require('app/http/validators/commentValidator');

// Middlewares
const redirectIfNotAuthenticated = require('app/http/middleware/redirectIfNotAuthenticated');

// Home routes
router.get('/' , homeController.index);
router.get('/about' , homeController.about);
router.get('/courses' , courseController.index);
router.get('/courses/:course' , courseController.single);

// Comment
router.post('/comment' , redirectIfNotAuthenticated.handle , commentValidator.handle() , homeController.comment);

// download
router.get('/download/:episode' , courseController.download);

// payment
router.post('/courses/payment' , redirectIfNotAuthenticated.handle , courseController.payment);
router.post('/courses/payment/checker' , redirectIfNotAuthenticated.handle , courseController.checker);

// user panel
router.get('/user/panel' , userController.index);
router.get('/user/panel/history' , userController.history);
router.get('/user/panel/vip' , userController.vip);
// Vip payment
router.post('/user/panel/vip/payment' , redirectIfNotAuthenticated.handle , userController.vipPayment);
router.get('/user/panel/vip/payment/checker' , redirectIfNotAuthenticated.handle ,  userController.vipChecker);


// sitemap (CEO)
router.get('/sitemap.xml' , homeController.sitemap);
// router.get('/feed/courses' , homeController.feedCourses);
// router.get('/feed/episodes' , homeController.feedEpisodes);
// router.get('/ajaxupload' , (req , res , next) => res.render('home/ajaxupload'));

//logout passport
router.get('/logout' , (req , res) => {
    req.logout();
    res.clearCookie('remember_token');
    res.redirect('/');
});

router.get('/user/activation/:token' , userController.activation);

module.exports = router;