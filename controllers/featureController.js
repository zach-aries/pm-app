let Feature = require('../models/feature');
let Task = require('../models/task');

exports.get_feature = function (_id, cb) {
  Feature.findOne({_id:_id})
      .exec(function (err, feature) {
         if (err) {
             console.log(err);
             cb(err, null);
             return
         }
         cb(null, feature);
      });
};

exports.store_feature = function (name, projectID, parentID, est_start_date, est_end_date, cb) {
    var feature = new Feature({
        name: name,
        project: projectID,
        parent: parentID,
        est_start_date: new Date(est_start_date),
        est_end_date: new Date(est_end_date)
    });

    feature.save(function (err) {
        if (err) {
            console.log(err);
            cb(err,null);
            return;
        }
        console.log('New Feature:\n' + feature);
        cb(null, feature);
    });
};

exports.update_feature = function(_id, name, est_start_date, est_end_date, cb) {

    Feature.findOneAndUpdate({_id: _id}, {$set:{
        name:name,
        est_start_date: new Date(est_start_date),
        est_end_date: new Date(est_end_date)
    }}, {new: true})
        .lean()
        .exec(function (err, feature) {
            if (err) {
                cb(err, null);
                return;
            }

            cb(null, feature);
        })
};

exports.remove_featureAndTasks = function (_id, cb) {
    Feature.findOne({ _id:_id })
        .exec(function (err, feature) {
            if (err) {
                console.log(err);
                cb(err, null);
                return
            }

            feature.tasks.forEach(function (task) {
                Task.find({_id:task})
                    .exec(function (err, task_doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Removed Task:', task_doc);
                            task_doc.remove();
                        }
                    });
            });

            feature.remove();
            console.log('Removed Feature:\n' + feature);
            cb(null, feature);
        });
};

exports.remove_featureAndChildren = function (_id, cb) {
    Feature.findOne({ _id:_id })
        .exec(function (err, feature) {
            if (err) {
                console.log(err);
                cb(err, null);
                return
            }

            remove_feature_parentID(_id, cb);

            feature.remove();
            console.log('Removed Feature:\n' + feature);
            cb(null, feature);
        });
};

let remove_feature_parentID = function (parentID, cb) {
    Feature.find({parent:parentID})
        .exec(function (err, features) {
            if (err) {
                console.log(err);
                cb(err, null)
            }

            features.forEach(function (feature) {
                feature.tasks.forEach(function (task) {
                    Task.find({_id:task})
                        .exec(function (err, task_doc) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Removed Task:', task_doc);
                                task_doc.remove();
                            }
                        });
                });
                remove_feature_parentID(feature._id, cb);
                feature.remove();
                console.log('Removed Feature:', feature);
            });
        });
};

exports.add_taskToFeature = function (featureID, taskID, cb) {
    Feature.findOneAndUpdate({ _id: featureID}, {$push: {tasks: taskID}})
        .exec(function (err, feature) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }

            //Successful, so return query
            console.log('Update Feature: ' + feature);
            cb(null, feature);
        });
};

exports.get_featureByID = function (_id, cb) {
    Feature.findOne({ _id:_id})
        .lean()
        .populate('tasks')
        .exec(function (err, feature) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, feature);
        });
};

exports.get_featuresByProjectID = function (_id, cb) {
    Feature.find({ project:_id})
        .lean()
        .populate('tasks')
        .exec(function (err, feature) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, feature);
        });
};