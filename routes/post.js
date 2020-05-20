var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase');
var multer = require('multer');
var upload = multer({ dest: '/public/images', limits: { fieldSize: 10000000 } });

// models
var User = require('../models/user');
var Post = require('../models/post');

/* GET postdata */
router.get('/:uid', firebase.verify, (req, res, next) => {
    var uid = req.params.uid;

    Post.findById(uid, (error, post) => {
        if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
          });

          if(post) {
            res.status(200).json({
                status: 200,
                message: "Successfully got post object",
                post: post,
                timestamp: Date.now()
            });
          } else {  
            res.status(404).json({
                status: 404,
                error: {
                  code: "NO_POST_FOUND",
                  message: "No post could be found with the following uid: " + uid
                },
                timestamp: Date.now()
              });
          }
    });
});

/* GET feedposts */
router.get('/feed', firebase.verify, (req, res, next) => {
    var uid = req.decodedToken.uid;
    
    User.findById(uid, (error, user) => {
        if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
        });

        if(user) {
            var followed = [];
            for(let i = 0; i < user.followed.length; i++) {
                followed.push(user.followed[i].uid);
            }

            if(followed.length > 0) {
                Post.find({'user._id': { $in: followed }}).sort({'createdAt': -1}).limit(40).then((posts) => {
                    if(posts) {
                        res.status(200).json({
                            status: 200,
                            message: "Successfully got all posts",
                            posts: posts,
                            timestamp: Date.now()
                        });
                    } else {
                        res.status(404).json({
                            status: 404,
                            error: {
                                code: "NO_POST_FOUND",
                                message: "No posts could be found"
                            },
                            timestamp: Date.now()
                        });
                    }
                });
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Successfully got all posts",
                    posts: [],
                    timestamp: Date.now()
                });
            }
        } else {
            res.status(404).json({
                status: 404,
                error: {
                    code: "NO_USER_FOUND",
                    message: "No user could be found with the following uid: " + uid
                },
                timestamp: Date.now()
              });
        }
    })
});

/* POST add post */ 
router.post('/add', firebase.verify, upload.fields([{name: 'images', maxCount: 4}, {name: 'videos', maxCount: 4}]), (req, res, next) => {
    // TODO File size check

    var images = req.files["images"];
    var videos = req.files["videos"];

    if(req.body.content != null) {
        User.findById(req.decodedToken.uid, (error, user) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            if(user) {
                var post = new Post();
                post._id = create_UUID();
                post.user = {
                    _id: user._id,
                    username: user.username,
                    name: user.name
                };
                post.location = req.body.location != null ? req.body.location : "";
                post.content = req.body.content;
                post.images = images;
                post.videos = videos;

                post.save((err) => {
                    if(err) {
                        res.status(500).json({
                            status: 500,
                            error: err,
                            timestamp: Date.now()
                        });
                    } else {
                        res.status(200).json({
                            status: 200,
                            message: "Successfully created post",
                            post: post,
                            timestamp: Date.now()
                        });
                    }
                });
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
    } else {
        res.status(400).json({
            status: 400,
            error: {
                code: "INVALID_BODY",
                message: "No content could be found in the body"
            },
            timestamp: Date.now()
        });
    }
});

/* POST like post */
router.post('/like', firebase.verify, (req, res, next) => {
    if(req.body.uid) {
        var post_id = req.body.uid;
        var username = req.body.username;

        Post.findById(post_id, (error, post) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            if(post) {
                var likes = post.likes;

                // check if user has already liked the post
                if(likes.some(e => e.uid == req.decodedToken.uid)) {
                    likes = likes.filter((object) => {return object.uid == req.decodedToken.uid});
                    
                    post.update({'likes': likes}, (error) => {
                        if(error) {
                            res.status(500).json({
                                status: 500,
                                error: error,
                                timestamp: Date.now()
                            });
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: "Successfully removed the like from the post",
                                type: "UNLIKE"
                            });
                        }
                    });
                } else {
                    likes.push({
                        uid: req.decodedToken.uid,
                        username: username,
                        createdAt: Date.now()
                    });

                    post.update({'likes': likes}, (error) => {
                        if(error) {
                            res.status(500).json({
                                status: 500,
                                error: error,
                                timestamp: Date.now()
                            });
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: "Successfully added the like to the post",
                                type: "LIKE"
                            });
                        }
                    });
                }
            } else {
                res.status(404).json({
                    status: 404,
                    error: {
                      code: "NO_POST_FOUND",
                      message: "No post could be found with the following uid: " + post_id
                    },
                    timestamp: Date.now()
                });
            }
        });
    }  
});

/* POST comment post */
router.post('/comment', firebase.verify, (req, res, next) => {
    if(req.body.uid && req.body.comment) {
        var post_id = req.body.uid;
        
        Post.findById(post_id, (error, post) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            
        });
    }
});

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}