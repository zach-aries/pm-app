var Task = require('../models/task')

exports.task_list = function (featureID, cb) {
    Task.find({ feature:featureID})
        .exec(function (err, tasks) {
            if (err) {
                console.log(err);
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
            console.log('Update Feature: ' + feature);
            cb(null, task);
        });
};

exports.store_task = function (name, desc, featureID, est_start_date, est_end_date, status, cb) {
    var task = new Task({
        name: name,
        description: desc,
        feature: featureID,
        est_start_date: new Date(est_start_date),
        est_end_date: new Date(est_end_date),
        status: status
    });

    task.save(function (err) {
        if (err) {
            console.log(err);
            cb(err, null);
            return;
        }
        console.log('New Task:\n' + task);
        cb(null, task);
    });
};

exports.remove_task = function (_id) {
    Task.find({ _id:_id }).remove().exec();
};

exports.remove_task = function (_id, cb) {
    Task.find({ _id:_id }).remove().exec(function (err, task) {
        if (err) {
            console.log(err);
            cb(err, null);
            return
        }
        console.log('Removed Task:\n' + task);
        cb(null, task);
    });
};

exports.get_taskByTaskID = function (_id, cb) {
    Task.findOne({ _id:_id})
        .exec(function (err, task) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, task);
        });
};

exports.update_status = function (_id, newStatus, cb) {
    Task.findOneAndUpdate({ _id: taskID}, {$push: {status: newStatus}})
        .exec(function (err, task) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            // Successful, so return query
            console.log('Update Feature: ' + feature);
            cb(null, task);
        });
};

exports.update_task = function(_id, _name, _description, _est_start_date, _est_end_date, cb) {
    Task.findOneAndUpdate({_id: _id}, {$set:{
        name:_name,
        description:_description,
        est_start_date: new Date(_est_start_date),
        est_end_date: new Date(_est_end_date)
    }}, {new: true})
        .lean()
        .exec(function (err, task) {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, task);
        })
};