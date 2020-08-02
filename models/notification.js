var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: {type: String, required: true},
    user_id: {type: String, required: true},
    code: {type: String, required: true},
    message: {type: String, required: true},
    action: {type: Boolean, required: true},
    additionalInformation: {type: Object, default: {}},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Post', postSchema);
