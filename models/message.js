var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    message: {type: String, required: true},
    project: { type: Schema.ObjectId, ref: 'Project', required: true},
    timestamp: {type: Date, required: false}
});

module.exports = mongoose.model('Message', MessageSchema);