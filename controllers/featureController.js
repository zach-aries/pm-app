var Feature = require('../models/feature');

exports.get_feature = function (_id, cb) {
  Feature.findOne({_id:_id})
      .exec(function (err, feature) {
         if (err) {
             cb(err, null);
             return
         }
         cb(null, feature);
      });
};

exports.store_feature = function (name, projectID, parentID, cb) {
    var feature = new Feature({
        name: name,
        project: projectID,
        parent: parentID
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

exports.add_taskToFeature = function (featureID, taskID, cb) {
    Feature.findOneAndUpdate({ _id: featureID}, {$push: {tasks: taskID}})
        .exec(function (err, feature) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            // console.log('Update Feature: ' + feature);
            cb(null, feature);
        });
};

exports.get_featureByID = function (_id, cb) {
    Feature.findOne({ _id:_id})
        .lean()
        .exec(function (err, feature) {
            if (err) {
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
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, feature);
        });
};