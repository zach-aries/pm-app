var User = require('../models/user');


exports.get_userByUsername = function (username, cb) {
    User.findOne({ username:username })
        .exec(function (err, user) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, user);
        });
};

exports.get_userByID = function (_id, cb) {
    User.findOne({ _id:_id })
        .exec(function (err, user) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, user);
        });
};

exports.get_projectList = function (_id, cb) {
    User.findOne({ _id:_id}, 'projects')
        .lean()
        .populate('projects')
        .exec(function (err, user) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            // Successful, so return query
            // console.log('Update Feature: ' + feature);
            cb(null, user);
        });
};

exports.get_projectUserList = function (projectID, cb) {
    User.find({projects:projectID})
        .lean()
        .exec(function (err, user) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            // Successful, so return query
            // console.log('Update Feature: ' + feature);
            cb(null, user);
        });
};

exports.add_project = function (userID, projectID, cb) {
    User.findOneAndUpdate({ _id: userID}, {$push: {projects: projectID}})
        .exec(function (err, user) {
            if (err) {
                console.log(err);
                cb(err,null);
                return;
            }
            // Successful, so return query
            // console.log('Update Feature: ' + feature);
            cb(null, user);
        });
};