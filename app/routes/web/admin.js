const express = require('express');
const router = express.Router();

// Controllers
const adminController = require('app/http/controllers/admin/adminController');
const courseController = require('app/http/controllers/admin/courseController');
const episodeController = require('app/http/controllers/admin/episodeController');
const commentController = require('app/http/controllers/admin/commentController');
const categoryController = require('app/http/controllers/admin/categoryController');
const userController = require('app/http/controllers/admin/userController');
const permissionController = require('app/http/controllers/admin/permissionController');
const roleController = require('app/http/controllers/admin/roleController');

// Middlewares
const convertFileToField = require('app/http/middleware/convertFileToField');

// Validators
const courseValidator = require('app/http/validators/courseValidator');
const episodeValidator = require('app/http/validators/episodeValidator');
const categoryValidator = require('app/http/validators/categoryValidator');
const registerValidator = require('app/http/validators/registerValidator');
const permissionValidator = require('app/http/validators/permissionValidator');
const roleValidator = require('app/http/validators/roleValidator');

// Helpers
const upload = require('app/helpers/uploadImage');
const gate = require('app/helpers/gate');

router.use((req , res , next) => {
    res.locals.layout = "admin/master" 
    // for create another master page for admin panel
    // change layout varraible i was set in main index.js app.set('layout' , varraible)
    next();
});

// Admin routes
router.get('/' , adminController.index);


// Course Routes
router.get('/courses' , gate.can('show-courses') , courseController.index);
router.get('/courses/create' , courseController.create);
router.post('/courses/create' ,
        upload.single('images'),
        convertFileToField.handle,
        courseValidator.handle(),
        courseController.store
);
router.delete('/courses/:id' , courseController.destroy);
// for edit
router.get('/courses/:id/edit' , courseController.edit); // form
router.put('/courses/:id' ,
        upload.single('images'),
        convertFileToField.handle,
        courseValidator.handle(), 
        courseController.update
); // update data
// data /courses/:id/edit === post ===> /courses/:id


// Permission Routes
router.get('/users/permissions' , permissionController.index);
router.get('/users/permissions/create' , permissionController.create);
router.post('/users/permissions/create' , permissionValidator.handle() , permissionController.store);
router.delete('/users/permissions/:id' , permissionController.destroy);
// for edit
router.get('/users/permissions/:id/edit' , permissionController.edit); // form
router.put('/users/permissions/:id' , permissionValidator.handle() , permissionController.update); // update data


// Roles Routes
router.get('/users/roles' , roleController.index);
router.get('/users/roles/create' , roleController.create);
router.post('/users/roles/create' , roleValidator.handle() , roleController.store);
router.delete('/users/roles/:id' , roleController.destroy);
// for edit
router.get('/users/roles/:id/edit' , roleController.edit); // form
router.put('/users/roles/:id' , roleValidator.handle() , roleController.update); // update data


// // Episodes Routes
// router.get('/episodes' , episodeController.index);
// router.get('/episodes/create' , episodeController.create);
// router.post('/episodes/create' , episodeValidator.handle() , episodeController.store);
// router.delete('/episodes/:id' , episodeController.destroy);
// // for edit
// router.get('/episodes/:id/edit' , episodeController.edit); // form
// router.put('/episodes/:id' , episodeValidator.handle() , episodeController.update); // update data
// // data /episodes/:id/edit === post ===> /episodes/:id

const episodeRouter = express.Router();
        episodeRouter.get('/' , episodeController.index);
        episodeRouter.get('/create' , episodeController.create);
        episodeRouter.post('/create' , episodeValidator.handle() , episodeController.store);
        episodeRouter.delete('/:id' , episodeController.destroy);
        // for edit
        episodeRouter.get('/:id/edit' , episodeController.edit); // form
        episodeRouter.put('/:id' , episodeValidator.handle() , episodeController.update); // update data
        // data /episodes/:id/edit === post ===> /episodes/:id
router.use('/episodes' , gate.can('episodes-all') , episodeRouter);


// Categories Routes
router.get('/categories' , categoryController.index);
router.get('/categories/create' , categoryController.create);
router.post('/categories/create' , categoryValidator.handle() , categoryController.store);
router.delete('/categories/:id' , categoryController.destroy);
// for edit
router.get('/categories/:id/edit' , categoryController.edit); // form
router.put('/categories/:id' , categoryValidator.handle() , categoryController.update); // update data
// data /episodes/:id/edit === post ===> /categories/:id


// Comments
router.get('/comments' , commentController.index);
router.delete('/comments/:id' , commentController.destroy);
router.get('/comments/approved' , commentController.approved);
router.put('/comments/:id/approved' , commentController.update);


// ckeditor upload image
router.post('/upload-image' , upload.single('upload') , adminController.uploadImage);


// Users Panel Routes
router.get('/users' , userController.index);
router.delete('/users/:id' , userController.destroy);
router.get('/users/:id/toggleadmin' , userController.toggleadmin);
// create user
router.get('/users/create' , userController.create);
router.post('/users' , registerValidator.handle() , userController.store);
// add roles
router.get('/users/:id/addrole' , userController.addrole); // show form
router.put('/users/:id/addrole' , userController.storeAddRole); // update user data

module.exports = router;