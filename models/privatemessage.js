var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: {type: String, required: true},
    userIDs: {type: Array, require: true},
    userInformation: {type: Array, required: true},
    messages: {type: Array, default: new Array()},
    media: {type: Array, default: new Array()},
    milestones: {type: Array, default: new Array()},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Privatemessage', postSchema);
