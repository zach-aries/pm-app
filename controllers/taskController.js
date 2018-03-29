var Task = require('../models/task')

exports.task_list = function (featureID, cb) {
    Task.find({ feature:featureID})
        .exec(function (err, tasks) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, tasks);
        });
};

exports.add_responsible = function (userID, taskID, cb) {
    Task.findOneAndUpdate({ _id: taskID}, {$push: {responsible: userID}})
        .exec(function (err, task) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            // Successful, so return query
            // console.log('Update Feature: ' + feature);
            cb(null, task);
        });
};

exports.store_task = function (name, desc, featureID, est_start_date, est_end_date, status, cb) {
    var task = new Task({
        name: name,
        description: desc,
        feature: featureID,
        est_start_date: est_start_date,
        est_end_date: est_end_date,
        status: status
    });

    task.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Task:\n' + task);
        cb(null, task);
    });
};