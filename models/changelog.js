var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: {type: String, required: true},
    version: {type: String, required: true},
    date: {type: String, required: true},
    timestamp: {type: Date, required: true},
    ios: {type: Array, required: true},
    android: {type: Array, required: true}
});

module.exports = mongoose.model('Changelog', postSchema);
