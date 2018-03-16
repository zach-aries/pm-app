var express = require('express');
var router = express.Router();

// Require Controller Modules
var dashboard_controller = require('../controllers/dashboardController');

/* GET dashboard page. */
router.get('/', dashboard_controller.index);

module.exports = router;
