var project_controller = require('../controllers/projectController');
var async = require('async');

var Message = require('../models/message');

// TODO add project id for get
exports.message_list = function (project_id, cb) {
    //console.log("feature id: " + project_id);

    Message.find()
        .exec(function (err, messages) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, messages);
        });
};

exports.store_message = function (data, cb) {
    var date = new Date(data.timestamp);

    var message = new Message({
        user: data.user,
        message: data.message,
        timestamp: date
    });

    message.save(function (err) {
        if (err) {
            console.log(err);
            cb(err,null);
            return;
        }
        cb(null, message);
    });
};