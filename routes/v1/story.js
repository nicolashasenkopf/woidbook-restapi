var express = require('express');
var router = express.Router();
var firebase = require('../../firebase/firebase');
var multer = require('multer');
var upload = multer({ dest: '/public/story/images', limits: { fieldSize: 10000000 } });

// models
var User = require('../../models/user')
var Post = require('../../models/post');

/* GET all stories */
router.get('/:uid/all', firebase.verify, (req, res, next) => {
    var user_id = req.params.uid;

    User.findOne(user_id, (error, user) => {
        if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
        });

        if(user) {
            if(user.options.privacy.privat == false) {
                if(user.stories.length > 0) {
                    if(user_id == req.decodedToken.uid) {
                        res.status(200).json({
                            status: 200,
                            message: "Successfully got all stories",
                            stories: user.stories,
                            timestamp: Date.now()
                        });
                    } else {
                        delete user.stories.views;
                        res.status(200).json({
                            status: 200,
                            message: "Successfully got all stories",
                            stories: user.stories,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    res.status(200).json({
                        status: 200,
                        message: "Successfully got all stories from the user but the array is empty",
                        stories: [],
                        timestamp: Date.now()
                    });
                }
            } else {
                if(user.follower.some(e => e.uid === req.decodedToken.uid)) {
                    if(user_id == req.decodedToken.uid) {
                        res.status(200).json({
                            status: 200,
                            message: "Successfully got all stories",
                            stories: user.stories,
                            timestamp: Date.now()
                        });
                    } else {
                        delete user.stories.views;
                        res.status(200).json({
                            status: 200,
                            message: "Successfully got all stories",
                            stories: user.stories,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    res.status(403).json({
                        status: 403,
                        error: {
                          code: "ACCOUNT_PRIVAT",
                          message: "You are not a follower"
                        },
                        timestamp: Date.now()
                    }); 
                }
            }
        } else {
            res.status(404).json({
                status: 404,
                error: {
                  code: "NO_USER_FOUND",
                  message: "No user could be found with the following uid: " + req.decodedToken.uid
                },
                timestamp: Date.now()
            });
        }
    });
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