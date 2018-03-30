var message_controller = require('../controllers/messengerController');
var user_controller = require('../controllers/userController');
var project_controller = require('../controllers/projectController');
var feature_controller = require('../controllers/featureController');
var task_controller = require('../controllers/taskController');

var async = require('async');

module.exports = function (io) {


    io.on('connection', function(socket){

        socket.on('user connected', function (projectID) {
            async.parallel({
                messages: function(callback) {
                    message_controller.get_projectMessages(projectID, callback);
                },
                features: function (callback) {
                    feature_controller.get_featuresByProjectID(projectID, callback);
                },
                users: function (callback) {
                    user_controller.get_projectUserList(projectID, callback)
                }
            }, function(err, results) {

                // TODO cleanup

                var project = [];
                results.features.forEach(function (feature) {
                    // create feature object
                    /**
                        must create custom object because cannot search for _id with 'find' method,
                        also allows creation of children array in each object
                    */
                    var f = {
                        name: feature.name,
                        _id: String(feature._id),
                        children: [],
                        tasks: feature.tasks
                    };
                    // add root nodes
                    if (feature.parent === null){
                        // if no parent, then root node. Push to main array
                        //console.log('Add f: ', f)
                        project.push(f);
                        test(results.features, f);
                    }
                });

                var data = {
                    messages: results.messages,
                    project: project,
                    features: results.features,
                    project_users: results.users
                };

                //io.socket.in(projectID).emit('init', data);

                // joing room with project ID
                socket.join(projectID);
                // send confirmation to sending client only
                socket.emit('init', data);
            });
        });

        socket.on('message', function (userID, projectID, msg) {
            var timestamp = new Date();

            async.waterfall([
                function (callback) {
                    // save message in db
                    message_controller.store_message(userID, projectID, msg, timestamp, callback);
                },
                function(m, callback) {
                    // query stored message so we can get username
                    message_controller.get_message(m._id, callback);
                }
            ], function (err, result) {
                // TODO Error handling

                // emit message to users in room
                io.sockets.in(projectID).emit('message', result);
            });
        });

        /**
         * add feature
         *
         * @param name
         * @param projectID
         * @param parentID - pass null for root feature
         */
        socket.on('add feature', function (name, projectID, parentID) {
            if (!parentID) {
                parentID = null;
            }
            async.series({
                feature: function (callback) {
                    feature_controller.store_feature(name, projectID, parentID, callback)
                }
            }, function(err, result) {
                //TODO Error handling
                io.sockets.in(projectID).emit('add feature', result.feature);
            });
        });

        socket.on('add task', function (name, description, featureID, est_start_date, est_end_date, status) {
            var return_task;
            async.waterfall([
                function (callback) {
                    task_controller.store_task(name, description, featureID, est_start_date, est_end_date, status, callback);
                },
                function(task, callback) {
                    return_task = task;
                    feature_controller.add_taskToFeature(featureID, task._id, callback);
                }
            ], function (err, result) {
                // TODO Error handling
                io.sockets.in(result.project).emit('add task', return_task, featureID);
            });
        });

        socket.on('add user', function (username, projectID) {
            var user;
            async.waterfall([
                function (callback) {
                    user_controller.get_userByUsername(username, callback);
                },
                function(u, callback) {
                    if(u){
                        user = u;
                        user_controller.add_project(u._id, projectID, callback);
                    } else {
                        callback(null, 'error');
                    }
                }
            ], function (err, result) {
                // TODO Error handling
                console.log('added project to user: ', result);
                if (!err) {
                    io.sockets.in(projectID).emit('add user', user);
                }
            });
        });

        socket.on('add responsible', function (userID, taskID) {
            async.series({
                task: function (callback) {
                    task_controller.add_responsible(userID, taskID, callback);
                }
            }, function(err, results) {
                //TODO Error handling
                console.log('Added User:\n', results.task);
            });
        });
    });
};

function test(data, parent) {
    data.forEach(function (obj) {
        if (obj.parent !== null){
            if (parent._id === String(obj.parent)){
                var feature = {
                    name: obj.name,
                    _id: String(obj._id),
                    children: [],
                    tasks: obj.tasks
                };
                test(data, feature);

                parent.children.push(feature);
            }
        }
    });
}