var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: {type: String, required: true},
    user: {type: Object, default: {
        _id: String,
        username: String,
        name: String
    }},
    location: {type: String, default: ""},
    content: {type: String, required: true},
    images: {type: Array, default: Array},
    videos: {type: Array, default: Array},
    likes: {type: Array, default: Array},
    comments: {type: Array, default: Array},
    reports: {type: Array, default: Array},
    mentions: {type: Array, default: Array},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Post', postSchema);
