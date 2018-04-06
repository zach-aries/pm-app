var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FeatureSchema = new Schema({
    name: {type: String, required: true, max: 100},
    project: { type: Schema.ObjectId, ref: 'Project', required: true},
    parent: {type: Schema.ObjectId, ref: 'Feature'},
    tasks: [{type: Schema.ObjectId, ref: 'Task'}],
    est_start_date: {type: Date, required: true},
    est_end_date: {type: Date, required: true},
});

module.exports = mongoose.model('Feature', FeatureSchema);