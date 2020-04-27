const express = require('express');
const router = express.Router();

// Controllers
const homeController = require('app/http/controllers/api/v1/homeController');

router.get('/user' , homeController.user);
router.get('/user/history' , homeController.history);

module.exports = router;