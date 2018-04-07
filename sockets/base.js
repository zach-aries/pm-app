var message_controller = require('../controllers/messengerController');
var user_controller = require('../controllers/userController');
var project_controller = require('../controllers/projectController');
var feature_controller = require('../controllers/featureController');
var task_controller = require('../controllers/taskController');

var async = require('async');

module.exports = function (io) {


    io.on('connection', function(socket){

        socket.on('user connected', function (projectID, userID) {
            // get all data for dashboard
            // done in parallel as order does not matter
            async.parallel({
                messages: function(callback) {
                    message_controller.get_projectMessages(projectID, callback);
                },
                features: function (callback) {
                    feature_controller.get_featuresByProjectID(projectID, callback);
                },
                users: function (callback) {
                    user_controller.get_projectUserList(projectID, callback)
                },
                connected_user: function (callback) {
                    user_controller.get_userByID(userID, callback)
                }
            }, function(err, results) {
                // create a tree structure out of features/tasks
                var project = project_controller.create_project_tree(results.features);

                var data = {
                    messages: results.messages,
                    project: project,
                    features: results.features,
                    project_users: results.users
                };

                // joing room with project ID
                socket.join(projectID);
                // send confirmation to sending client only
                socket.emit('init', data);
                // send user connected notification to all clients in room
                io.sockets.in(projectID).emit('user connected', results.connected_user);
            });
        });

        /**
         * Stores new message in datatbase and emits it to the
         * other clients in same room
         *
         */
        socket.on('message', function (userID, projectID, msg) {
            var timestamp = new Date();

            // must use waterfall as get message depends on storing the message first.
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
        socket.on('add feature', function (name, projectID, parentID, est_start_date, est_end_date) {
            if (!parentID) {
                parentID = null;
            }
            async.series({
                feature: function (callback) {
                    feature_controller.store_feature(name, projectID, parentID, est_start_date, est_end_date,  callback)
                }
            }, function(err, result) {
                //TODO Error handling
                io.sockets.in(projectID).emit('add feature', result.feature);
            });
        });

        /**
         * adds task to database
         *
         * return_task:
         * {
         *      name: {type: String, required: true, max: 100},
         *      description: {type: String, required: true, max: 512},
         *      responsible: [{type: Schema.ObjectId, ref: 'User', required: true}],
         *      feature: {type: Schema.ObjectId, ref: 'Feature', required: true},
         *      est_start_date: {type: Date, required: true},
         *      est_end_date: {type: Date, required: true},
         *      start_date: {type: Date},
         *      end_date: {type: Date},
         *      status: {type: String, required: true, enum: ['Pending', 'Started', 'Complete', 'Overdue']}
         * }
         */
        socket.on('add task', function (name, description, featureID, est_start_date, est_end_date, status) {
            // creates var for return value
            // lose access to task after second waterfall call
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

        /**
         * Adds user to database
         * finds user by username and pushes their id to
         * project.
         *
         */
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

        /**
         * Adds responsible user to task
         *
         */
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