var task_controller = require('../controllers/taskController');
var feature_controller = require('../controllers/featureController');
var project_controller = require('../controllers/projectController');
var user_controller = require('../controllers/userController');

var async = require('async');

exports.index = function (req, res) {
    async.parallel({
        project: function(callback) {
            project_controller.projectByID(req.params.projectID, callback);
        },
    }, function(err, results) {

        var data = {
            title: 'Dashboard',
            user: req.user,
            project: results.project,
            errors: req.flash('error')
        };

        res.render('pages/dashboard', data);
    });
};

exports.project_selector = function (req, res) {
    async.parallel({
        user: function (callback) {
            user_controller.get_projectList(req.user._id, callback);
        }
    }, function(err, results) {

        var data = {
            title: 'Project Selector',
            user: req.user,
            projects: results.user.projects,
            errors: req.flash('error')
        };

        res.render('pages/project_selector', data);
    });
};

exports.new_project = function (req, res) {
    const name = req.body.name;
    const desc = req.body.description;
    var project;

    req.checkBody('name', 'Please enter a project name').not().isEmpty();

    var errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors);
        res.redirect('/dashboard/projects');
    } else {
        async.waterfall([
            function (callback) {
                project_controller.create_project(name, desc, req.user._id, callback);
            },
            function(p, callback) {
                if(p){
                    project = p;
                    user_controller.add_project(req.user._id, p._id, callback);
                    //project_controller.add_user(projectID, user._id, callback);
                } else {
                    callback(null, 'error');
                }
            }
        ], function (err, result) {
            if (err) {
                var error = {
                    msg: err._message,
                    name: err.name
                };
                req.flash('error', [error]);
                res.redirect('/dashboard/projects');
            } else {
                res.redirect('/dashboard/' + project._id);
            }
        });
    }
};