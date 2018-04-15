var message_controller = require('../controllers/messengerController');
var user_controller = require('../controllers/userController');
var project_controller = require('../controllers/projectController');
var feature_controller = require('../controllers/featureController');
var task_controller = require('../controllers/taskController');

var async = require('async');

module.exports = function (io) {


    io.on('connection', function (socket) {

        var roomID;

        socket.on('user connected', function (projectID, userID) {
            // get all data for dashboard
            // done in parallel as order does not matter
            async.parallel({
                project_info: function (callback) {
                    project_controller.projectByID(projectID, callback);
                },
                messages: function (callback) {
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
            }, function (err, results) {
                // create a tree structure out of features/tasks
                var project = project_controller.create_project_tree(results.features);

                // joing room with project ID
                socket.join(projectID);
                roomID = projectID;

                /*var sockets = io.in(projectID);
                Object.keys(sockets.sockets).forEach(function (item) {
                    console.log("TODO: Item:", sockets.sockets[item].username)
                });*/

                socket.nickname = results.connected_user.username;

                var roomSockets = io.in(projectID);

                var userList = [];
                Object.keys(roomSockets.sockets).forEach(function (item) {
                    var rooms = io.sockets.adapter.sids[item];
                    if( rooms[projectID]) {
                        userList.push(roomSockets.sockets[item].nickname);
                    }
                });

                var data = {
                    project_info: results.project_info,
                    messages: results.messages,
                    project: project,
                    features: results.features,
                    project_users: results.users,
                    user_list: userList
                };

                // send confirmation to sending client only
                socket.emit('init', data);
                // send updated user list notification to all clients in room
                io.sockets.in(projectID).emit('userlist update', userList);
            });
        });

        /*
        * Gets all the usernames of all the sockets in the room again on a disconnect
        * Then emits it out to all the clients
        * */
        socket.on('disconnect', function(projectID){


            var roomSockets = io.in(projectID);
            var userList = [];

            Object.keys(roomSockets.sockets).forEach(function (item) {
                var rooms = io.sockets.adapter.sids[item];
                if( rooms[roomID]) {
                    userList.push(roomSockets.sockets[item].nickname)
                }
            });

            io.sockets.in(roomID).emit('userlist update', userList);

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
                function (m, callback) {
                    // query stored message so we can get username
                    message_controller.get_message(m._id, callback);
                }
            ], function (err, result) {
                // TODO Error handling

                // emit message to users in room
                io.sockets.in(projectID).emit('message', result);
            });
        });

        socket.on('update project', function (projectID, name, description) {
            console.log(projectID, name, description);
            async.parallel({
                project: function (callback) {
                    project_controller.update_project(projectID, name, description, callback);
                }
            }, function (err, result) {
                console.log('updated project:\n', result.project);

                io.sockets.in(roomID).emit('update project', result.project);
            });
        });

        socket.on('delete project', function (projectID) {
            async.parallel({
                project: function (callback) {
                    project_controller.remove_project(projectID, callback);
                },
                features: function (callback) {
                    feature_controller.get_featuresByProjectID(projectID, callback);
                }
            }, function (err, result) {
                if (!err) {
                    // assuming openFiles is an array of file names
                    async.each(result.features, function(feature, callback) {

                        feature_controller.remove_featureAndChildren(feature._id, callback);
                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if( err ) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log(err);
                        } else {
                            console.log('All features deleted');
                        }
                    });

                    io.sockets.in(roomID).emit('delete project');
                } else {
                    console.log(err);
                }
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
                    feature_controller.store_feature(name, projectID, parentID, est_start_date, est_end_date, callback)
                }
            }, function (err, result) {
                //TODO Error handling
                io.sockets.in(projectID).emit('add feature', result.feature);
            });
        });

        socket.on('update feature', function (_id, name, est_start_date, est_end_date) {
            async.series({
                feature: function (callback) {
                    feature_controller.update_feature(_id, name, est_start_date, est_end_date, callback);
                }
            }, function (err, result) {
                //TODO Error handling
                io.sockets.in(roomID).emit('update feature', result.feature);
            });
        });

        /**
         * Removes feature from database
         *
         * @param _id - feature id
         */
        socket.on('remove feature', function (featureID, projectID) {
            async.series({
                feature: function (callback) {
                    feature_controller.remove_featureAndChildren(featureID, callback);
                },
                tasks: function (callback) {
                    task_controller.remove_task_featureID(featureID, callback);
                },
            }, function (err, result1) {
                async.series({
                    features: function (callback) {
                        feature_controller.get_featuresByProjectID(projectID, callback);
                    },
                }, function (err, result2) {
                    //console.log('r', result);
                    io.sockets.in(roomID).emit('remove feature', featureID, result2.features);
                });
            });
        });

        /**
         * Select feature form db
         *
         * @param _id - feature id
         */
        socket.on('get feature', function (featureID, projectID) {
            async.series({
                feature: function (callback) {
                    feature_controller.get_featureByID(featureID, callback)
                }
            }, function (err, result) {
                console.log('get feature:\n',result);

                io.sockets.in(projectID).emit('get feature', result.feature);
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
                function (task, callback) {
                    return_task = task;
                    feature_controller.add_taskToFeature(featureID, task._id, callback);
                }
            ], function (err, result) {
                // TODO Error handling
                io.sockets.in(result.project).emit('add task', return_task, featureID);
            });
        });

        /**
         * Removes task from database
         *
         * @param _id - task id
         */
        socket.on('remove task', function (projectID, taskID) {
            async.series({
                task: function (callback) {
                    task_controller.remove_task(taskID, callback);
                }
            }, function (err, result) {
                //TODO Error handling
                io.sockets.in(projectID).emit('remove task', taskID);
            });
        });

        /**
         * Select task form db
         * 
         * @param _id - task id
         */

        socket.on('get task', function (taskID, projectID) {
            async.series({
                task: function (callback) {
                    task_controller.get_taskByTaskID(taskID, callback)
                }
            }, function (err, result) {
                console.log(result);
                io.sockets.in(projectID).emit('get task', result.task);
            });
        });

        /**
         * update task's status
         * 
         * @param _id - task id
         */

        socket.on('update status', function (taskID, newStatus) {
            async.series({
                task: function (callback) {
                    task_controller.update_status(taskID, newStatus, callback)
                }
            }, function (err, result) {
                console.log(result);
                socket.emit('update status', taskID, newStatus);
                io.sockets.in(taskID).emit('update status', result.task);
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
                function (u, callback) {
                    if (u) {
                        user = u;
                        user_controller.add_project(u._id, projectID, callback);
                    } else {
                        callback(null, u);
                    }
                }
            ], function (err, result) {
                if (!user) {
                    var error = 'User does not exist';
                    // send confirmation to sending client only
                    socket.emit('add user', user, error);
                } else {
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
            }, function (err, results) {
                //TODO Error handling
                console.log('Added User:\n', results.task);
            });
        });
    });
};