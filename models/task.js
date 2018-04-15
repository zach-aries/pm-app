var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    name: {type: String, required: true, max: 100},
    description: {type: String, required: true, max: 512},
    responsible: [{type: Schema.ObjectId, ref: 'User', required: true}],
    feature: {type: Schema.ObjectId, ref: 'Feature', required: true},
    project: {type: Schema.ObjectId, ref: 'Project', required: true},
    est_start_date: {type: Date, required: true},
    est_end_date: {type: Date, required: true},
    start_date: {type: Date},
    end_date: {type: Date},
    status: {type: String, required: true, enum: ['Pending', 'Started', 'Complete', 'Overdue']}
});

module.exports = mongoose.model('Task', TaskSchema);