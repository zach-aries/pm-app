// Project Model
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    owner: { type: Schema.ObjectId, ref: 'User'},
    users: [{ type: Schema.ObjectId, ref: 'User'}],
    //features: [{ type: Schema.ObjectId, ref: 'Feature'}]
});

ProjectSchema
    .virtual('url')
    .get(function () {
        return '/dashboard/' + this._id;
    });

module.exports = mongoose.model('Project', ProjectSchema);