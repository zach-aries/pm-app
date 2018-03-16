var Task = require('../models/task')

exports.task_list = function (feature_id, cb) {

    console.log("feature id: " + feature_id);

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