var task_controller = require('../controllers/taskController');
var feature_controller = require('../controllers/featureController');
var project_controller = require('../controllers/projectController');

var async = require('async');

exports.index = function (req, res) {

    async.parallel({
        tasks: function(callback) {
            task_controller.task_list(123, callback);
        },
    }, function(err, results) {

        // console.log('tasks: ', results)

        var project = {
            name: 'Project 1'
        };

        var data = {
            title: 'Dashboard',
            username: 'Micheal',
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

        console.log('projects: ', results);

        var project = {
            name: 'Project 1'
        };

        var data = {
            title: 'Project Selector',
            user: req.user,
            projects: results.projects
        };

        res.render('pages/project_selector', data);
    });
};

exports.new_project = function (req, res) {
    async.series({
        project: function(callback) {
            project_controller.create_project('Test Project', 'This project is for testing', null, [req.user._id], callback);
        }
    }, function(err, results) {
        res.redirect('/dashboard/projects')
    });
};