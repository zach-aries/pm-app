var task_controller = require('../controllers/taskController');
var feature_controller = require('../controllers/featureController');

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