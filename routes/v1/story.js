var express = require('express');
var router = express.Router();
var path = require('path');
var firebase = require('../../firebase/firebase');

// models
var User = require('../../models/user')
var Post = require('../../models/post');

const base_path = "http://api.woidbook.com/";

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

/* POST add story */
router.post('/add', firebase.verify, (req, res, next) => {

    var image_url;

    if(req.files && req.files.images != null) {
        if(isValid(req.files.images)) {
            var filename = post_id + '-1' + path.extname(req.files.images.name);
            req.files.images.mv('/public/story/images/' + filename, (error) => {
                if(error) res.status(500).json({
                    status: 500,
                    error: error,
                    timestamp: Date.now()
                });
            });

            image_url = base_path + "/story/images/" + filename;
        } else {
            res.status(403).json({
                status:  403,
                error: {
                    code: "WRONG_IMAGE_ENDING",
                    message: "The ending is invalid",
                    mimetype: req.files.images.mimetype.toString()
                },
                timestamp: Date.now()
            });
        }
    }

    User.findById(req.decodedToken.uid, (error, user) => {
        if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
        });

        if(user) {
            if(user.leveling.level > 9 || user.stories.length < 5) {
                const story = {
                    uid: create_UUID(),
                    image_url: image_url,
                    views: [],
                    music: req.body.music != null ? req.body.music : "",
                    createdAt: Date.now()
                }

                user.stories.push(story);

                user.update({'stories': user.stories}, (error) => {
                    if(error) res.status(500).json({
                        status: 500,
                        error: error,
                        timestamp: Date.now()
                    });
                });

                res.status(200).json({
                    status: 200,
                    message: "Successfully added story",
                    story: story,
                    timestamp: Date.now()
                })
            } else {
                res.status(403).json({
                    status: 403,
                    error: {
                        code: "LEVEL_TOO_LOW",
                        message: "You have to be at least level 10 to post more than 5 stories"
                    },
                    timestamp: Date.now()
                });
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