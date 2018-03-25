var message_controller = require('../controllers/messengerController');
var async = require('async');

module.exports = function (io) {

    io.on('connection', function(socket){
        socket.on('user connected', function () {
            async.parallel({
                messages: function(callback) {
                    message_controller.message_list(123, callback);
                }
            }, function(err, results) {

                var data = {
                    messages: results.messages
                };
                // send confirmation to sending client only
                socket.emit('init', data);
            });
        });

        socket.on('message', function (data) {
            var timestamp = new Date();

            var msg = {
                user: data.username,
                message: data.msg,
                timestamp: timestamp
            };

            // message_controller.create_message(msg);
            create_message(msg);

            // emit message to all active users
            io.emit('message', msg);
        });
    });
};

function get_messages() {
    async.parallel({
        messages: function(callback) {
            message_controller.message_list(123, callback);
        }
    }, function(err, results) {

        var data = results.messages;
        console.log(data);
    });
};

function create_message(data) {
    async.series({
        message: function(callback) {
            message_controller.store_message(data, callback);
        }
    }, function(err, results) {
        //TODO Error handling
    });
}