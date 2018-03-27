var task_controller = require('../controllers/taskController');
var feature_controller = require('../controllers/featureController');
var project_controller = require('../controllers/projectController');
var user_controller = require('../controllers/userController');

var async = require('async');
var body = require('express-validator/check');


exports.index = function (req, res) {

    async.parallel({
        tasks: function(callback) {
            task_controller.task_list(123, callback);
        },
    }, function(err, results) {
        var project = {
            name: 'Project 1'
        };

        var data = {
            title: 'Dashboard',
            user: req.user,
            project: project,
            tasks: results.tasks
        };

        res.render('pages/dashboard', data);
    });
};

exports.project_selector = function (req, res) {
    async.parallel({
        projects: function(callback) {
            project_controller.project_list(req.user._id, callback);
        },
    }, function(err, results) {

        var data = {
            title: 'Project Selector',
            user: req.user,
            projects: results.projects,
            errors: req.flash('error')
        };

        res.render('pages/project_selector', data);
    });
};

exports.new_project = function (req, res) {
    const name = req.body.name;
    const desc = req.body.description;

    req.checkBody('name', 'Please enter a project name').not().isEmpty();

    var errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors);
        res.redirect('/dashboard/projects');
    } else {
        async.series({
            project: function(callback) {
                project_controller.create_project(name, desc, null, [req.user._id], callback);
            }
        }, function(err, results) {
            if (err) {
                var error = {
                    msg: err._message,
                    name: err.name
                };
                req.flash('error', [error]);
                res.redirect('/dashboard/projects');
            } else {
                console.log('after: ', results.users);
                res.redirect('/dashboard');
            }
        });
    }
};