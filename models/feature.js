var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FeatureSchema = new Schema({
    name: {type: String, required: true, max: 100},
    project: { type: Schema.ObjectId, ref: 'Project', required: true},
    parent: {type: Schema.ObjectId, ref: 'Feature'},
    tasks: [{type: Schema.ObjectId, ref: 'Task'}]
});

module.exports = mongoose.model('Feature', FeatureSchema);