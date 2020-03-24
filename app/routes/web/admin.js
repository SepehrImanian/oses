const express = require('express');
const router = express.Router();

// Controllers
const adminController = require('app/http/controllers/admin/adminController');

// Admin routes
router.get('/' , adminController.index);

module.exports = router;