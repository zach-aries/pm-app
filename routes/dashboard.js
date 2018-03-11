var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
    var project = {
        name: 'Project 1'
    }

    var data = {
        title: 'Dashboard',
        username: 'Micheal',
        project: project
    };
    res.render('pages/dashboard', data);
});

module.exports = router;
