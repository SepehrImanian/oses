const express = require('express');
const router = express.Router();

// Controllers
const courseController = require('app/http/controllers/api/v1/courseController');
const authController = require('app/http/controllers/api/v1/authController');

// Validator
const loginValidator = require('app/http/validators/loginValidator');


router.get('/courses' , courseController.courses);
router.get('/courses/:course' , courseController.singleCourse);
router.get('/courses/:course/comments' , courseController.singleCourseComments);

// Auth
router.post('/login' , loginValidator.handle() , authController.login);
// router.post('/register' , authController.register);


module.exports = router;