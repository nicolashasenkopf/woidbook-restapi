var express = require('express');
var router = express.Router();

const firebase = require('../../firebase/firebase');

const Message = require('../../models/privatemessage');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({error: null});
});

/* GET chat */
router.get('/get', firebase.verify, (req, res, next) => {
    if(req.query.user) {
        var userID = req.query.user
        Message.find({'userIDs': [userID, req.decodedToken.uid]}, (error, chat) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            if(chat) {
                res.status(200).json({
                    status: 200,
                    chat: chat,
                    timestamp: Date.now()
                });
            } else {
                res.status(404).json({
                    status: 404,
                    error: {
                        code: "NO_CHAT_FOUND",
                        message: "No chat found"
                    },
                    timestamp: Date.now()
                });
            }
        });
    }
});

/* POST chat message */
// TODO: ADD UPLOAD FUNCTION
router.post('/post', firebase.verify, (req, res, next) => {
    var message = req.body.message;
    var username = req.body.username;
    var targetID = req.body.targetid;
    var targetUsername = req.body.targetusername;
    var images = [];
    var videos = [];

    function isValid(file) {
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'audio/mp4' || file.mimetype == 'application/octet-stream') {
            return true;
        }
        return false;
    }

    if(req.files != null) {
        var image = req.files.images != null ? req.files.images : null;
        var video = req.files.video != null ? req.files.video : null;

        // Check for image
        if(image != null) {
            if(isValid(image)) {
                var filename = post_id + '-' + (i+1) + path.extname(image.name);
                image.mv('./public/message/images/' + filename, (error) => {
                    if(error) res.status(500).json({
                        status: 500,
                        error: error,
                        timestamp: Date.now()
                    });
                });

                images.push(base_path + "/message/images/" + filename);
            } else {
                res.status(403).json({
                    status:  403,
                    error: {
                        code: "WRONG_IMAGE_ENDING",
                        message: "The ending is invalid",
                        mimetype: image.mimetype.toString()
                    },
                    timestamp: Date.now()
                });
                return;
            }
        }

        // Check for video
        if(video != null) {
            if(isValid(video)) {
                var filename = post_id + '-' + (i+1) + path.extname(video.name);
                video.mv('./public/message/videos/' + filename, (error) => {
                    if(error) res.status(500).json({
                        status: 500,
                        error: error,
                        timestamp: Date.now()
                    });
                });

                videos.push(base_path + "/message/videos/" + filename);
            } else {
                res.status(403).json({
                    status:  403,
                    error: {
                        code: "WRONG_VIDEO_ENDING",
                        message: "The ending is invalid",
                        mimetype: video.mimetype.toString()
                    },
                    timestamp: Date.now()
                });
                return;
            }
        }
    }
    
    Message.find({'userIDs': [req.decodedToken.uid, targetID]}, (error, chat) => {
        if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
        });

        if(chat) {
            chat.messages.push({
                user: {
                    _id: req.decodedToken.uid,
                    username: username
                },
                message: message,
                media: images[0] != null ? images : videos[0] != null ? videos : null,
                createdAt: Date.now()
            });

            if(images[0] != null) chat.media.push(images[0]);
            if(videos[0] != null) chat.media.push(videos[0]);

            chat.update({'messages': chat.messages, 'media': chat.media}, (err) => res.status(500).json({status: 500, error: err}));
        } else {
            // TODO: CREATE NEW CHAT
            var chatObject = new Message();
            chatObject._id = create_UUID();
            chatObject.userInformation = [{_id: req.decodedToken.uid, username: username}, {_id: targetID, username: targetUsername}];
            chatObject.userIDs = [req.decodedToken.uid, targetID];
            chatObject.messages = [{
                user: {
                    _id: req.decodedToken.uid,
                    username: username
                },
                message: message,
                media: [],
                createdAt: Date.now()
            }];
            if(images[0] != null) chatObject.media.push(images[0]);
            if(videos[0] != null) chatObject.media.push(videos[0]);

            chatObject.save((err) => res.status(500).json({status: 500, error: err}));
        }
    })
});

// create unique id
function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

module.exports = router;
