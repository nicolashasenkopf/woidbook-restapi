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
                media: [],
                createdAt: Date.now()
            });

            chat.update({'messages': chat.messages}, (err) => res.status(500).json({status: 500, error: err}));
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
