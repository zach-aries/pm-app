var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    user: {type: String, required: true}, //type: Schema.ObjectId, ref: 'User', required: true},
    message: {type: String, required: true},
    timestamp: {type: Date, required: false}
});

module.exports = mongoose.model('Message', MessageSchema);