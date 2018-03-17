var Feature = require('../models/feature');

exports.feature_list = function (req, res) {
    res.send('NOT IMPLEMENTED: Feature list');
};

exports.create_feature = function (name, tasks, cb) {
    var feature = new Feature({
        name: name,
        tasks: tasks
    });

    feature.save(function (err) {
        if (err) {
            cb(err,null);
            return;
        }
        console.log('New Feature: ' + feature);
        cb(null, task);
    });
};