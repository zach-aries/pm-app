// Project Model
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
    name: {type: String, required: true},
    features: [{ type: Schema.ObjectId, ref: 'Feature'}]
});

ProjectSchema
    .virtual('url')
    .get(function () {
        return '/project/' + this._id;
    });

module.exports = mongoose.model('Project', ProjectSchema);