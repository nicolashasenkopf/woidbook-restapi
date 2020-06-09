var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: {type: String, required: true},
    username: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    role: {type: String, default: "user"},
    startLetters: {type: Array, default: new Array()},
    follower: {type: Array, default: new Array()},
    followed: {type: Array, default: new Array()},
    notifications: {type: Array, default: new Array()},
    options: {type: Object, default: {
        information: {type: Object, default: {
            birthday: {type: String, default: ""},
            description: {type: String, default: ""},
            region: {type: String, default: ""},
            town: {type: String, default: ""}
        }},
        notifications: { 
            comments: {type: Boolean, default: true},
            level: {type: Boolean, default: true},
            likes: {type: Boolean, default: true},
            mentions: {type: Boolean, default: true},
            requests: {type: Boolean, default: true},
        },
        privacy: {
            birthday: {type: Boolean, default: false},
            comments: {type: Boolean, default: true},
            likes: {type: Boolean, default: true},
            privat: {type: Boolean, default: false},
            town: {type: Boolean, default: false},
        }
    }},
    leveling: {type: Object, default: {
        lastPoints: {type: Number, default: 0},
        lastPointsGotFrom: {type: String, default: ""},
        points: {type: Number, default: 0},
        level: {type: Number, default: 0},
    }},
    stories: {type: Array, default: new Array()},
    verified: {type: Boolean, default: false},
    blocked: {type: Array, default: new Array()},
    lastConnection: {type: Date, default: Date.now()},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('User', userSchema);
