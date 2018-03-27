var User = require('../models/user');

exports.get_userByName = function (name, cb) {
    User.findOneAndRemove({ username:name }, '_id')
        .exec(function (err, user) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, user);
        });
};