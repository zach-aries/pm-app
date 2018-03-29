var express = require('express');
var passport = require('passport');
var router = express.Router();

// Require Controller Modules
var dashboard_controller = require('../controllers/dashboardController');

router.get('/projects', dashboard_controller.project_selector);

router.post('/new-project', dashboard_controller.new_project);

/* GET dashboard page. */
router.get('/:projectID', dashboard_controller.index);



router.get('/:username/:project', function(req, res) {
    res.send(req.params);
});

module.exports = router;
