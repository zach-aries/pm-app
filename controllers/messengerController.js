var project_controller = require('../controllers/projectController');
var async = require('async');

var Message = require('../models/message');

exports.get_message = function (_id, cb) {
    Message.findOne({_id:_id})
        .lean()
        .populate('user')
        .exec(function (err, messages) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, messages);
        });
};

exports.get_projectMessages = function (projectID, cb) {
    // TODO uncomment to get messages from specific project only
    //Message.find({ project:projectID})
    Message.find()
        .populate('user')
        .exec(function (err, messages) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, messages);
        });
};

exports.store_message = function (userID, projectID, msg, timestamp, cb) {
    var date = new Date(timestamp);

    var message = new Message({
        user: userID,
        message: msg,
        project: projectID,
        timestamp: date
    });

    message.save(function (err) {
        if (err) {
            console.log(err);
            cb(err,null);
            return;
        }

        console.log('New Message:\n' + message);
        cb(null, message);
    });
};