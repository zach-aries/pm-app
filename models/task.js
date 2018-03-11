var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    name: {type: String, required: true, max: 100},
    description: {type: String, required: true, max: 512},
    est_start_date: {type: Date, required: true},
    est_end_date: {type: Date, required: true},
    start_date: {type: Date},
    end_date: {type: Date},
    status: {type: String, required: true, enum: ['Pending','In Progress','Complete']}
});

module.exports = mongoose.model('Task', TaskSchema);