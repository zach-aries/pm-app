var Task = require('../models/task')

exports.task_list = function (feature_id, cb) {

    // console.log("feature id: " + feature_id);

    Task.find({}, 'name status')
        .exec(function (err, tasks) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, tasks);
        });
};

exports.create_task = function (name, desc, est_start_date, est_end_date, status, cb) {
    var task = new Task({
        name: name,
        description: desc,
        est_start_date: est_start_date,
        est_end_date: est_end_date,
        status: status
    });

    task.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        // console.log('New Task: ' + task);
        cb(null, task);
    });
};