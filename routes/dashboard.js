var express = require('express');
var passport = require('passport');
var router = express.Router();

// Require Controller Modules
var dashboard_controller = require('../controllers/dashboardController');

/* GET dashboard page. */
router.get('/', dashboard_controller.index);

router.get('/:username/projects', function(req, res) {
    res.send('projects page');
});

router.get('/:username/:project', function(req, res) {
    res.send(req.params);
});

module.exports = router;
