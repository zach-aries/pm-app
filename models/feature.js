var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FeatureSchema = new Schema({
    name: {type: String, required: true, max: 100},
    tasks: [{type: Schema.ObjectId, ref: 'Task'}]
});

module.exports = mongoose.model('Feature', FeatureSchema);