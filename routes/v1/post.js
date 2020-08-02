var express = require('express');
var router = express.Router();
var path = require('path');
var firebase = require('../../firebase/firebase');

const base_path = "http://api.woidbook.com/";

// models
var User = require('../../models/user');
var Post = require('../../models/post');

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
            if(post.user._id == req.decodedToken.uid) {   
                res.status(200).json({
                    status: 200,
                    message: "Successfully got post object",
                    post: post,
                    timestamp: Date.now()
                });
            } else {
                User.findById(post.user._id, (error, user) => {
                    if(error) res.status(500).json({
                        status: 500,
                        error: error,
                        timestamp: Date.now()
                    });

                    if(user) {
                        if(user.options.privacy.privat == true) {
                            if(user.follower.some(e => e.uid === req.decodedToken.uid)) {
                                delete post.reports;
                                res.status(200).json({
                                    status: 200,
                                    message: "Successfully got post object",
                                    post: post,
                                    timestamp: Date.now()
                                });
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
                        } else {
                            delete post.reports;
                            res.status(200).json({
                                status: 200,
                                message: "Successfully got post object",
                                post: post,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            }
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
router.post('/add', firebase.verify, (req, res, next) => {
    // TODO File size check
    var post_id = create_UUID();
    var images = [];
    var videos = [];

    function isValid(file) {
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'audio/mp4') {
            return true;
        }
        return false;
    }

    if(req.body.content != null) {
        if(req.files != null) {
            if(req.files.images[0] != null) {
                for(let i = 0; i < req.files.images.length; i++) {
                    if(isValid(req.files.images[i])) {
                        var filename = post_id + '-' + (i+1) + path.extname(req.files.images.name);
                        req.files.images[i].mv('/public/post/images/' + filename, (error) => {
                            if(error) res.status(500).json({
                                status: 500,
                                error: error,
                                timestamp: Date.now()
                            });
                        });
    
                        images.push(base_path + "/post/images/" + filename);
                    } else {
                        res.status(403).json({
                            status:  403,
                            error: {
                                code: "WRONG_IMAGE_ENDING",
                                message: "The ending is invalid",
                                mimetype: req.files.images[i].mimetype.toString()
                            },
                            timestamp: Date.now()
                        });
                        return;
                    }
                }
            } else if(req.files.images != null) {
                if(req.files.images != null) {
                    if(isValid(req.files.images)) {
                        var filename = post_id + '-1' + path.extname(req.files.images.name);
                        req.files.images.mv('/public/post/images/' + filename, (error) => {
                            if(error) res.status(500).json({
                                status: 500,
                                error: error,
                                timestamp: Date.now()
                            });
                        });
    
                        images.push(base_path + "/post/images/" + filename);
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
            }
    
            if(req.files.videos != null) {
                if(isValid(req.files.videos)) {
                    var filename = post_id + '-1' + path.extname(req.files.videos.name);
                    req.files.videos.mv('/public/post/videos/' + filename, (error) => {
                        if(error) res.status(500).json({
                            status: 500,
                            error: error,
                            timestamp: Date.now()
                        });
                    });
    
                    videos.push(base_path + "/post/videos/" + filename);
                } else {
                    res.status(403).json({
                        status:  403,
                        error: {
                            code: "WRONG_VIDEO_ENDING",
                            message: "The ending is invalid",
                            mimetype: req.files.images.mimetype.toString()
                        },
                        timestamp: Date.now()
                    });
                }
            }
        }

        User.findById(req.decodedToken.uid, (error, user) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            if(user) {
                var mentions = [];
                var splitContent = req.body.content.split(" ");
                for(let i = 0; i < splitContent.length; i++) {
                    if(splitContent[i].startsWith("@")) {
                        if(splitContent[i].length > 5) {
                            mentions.push(splitContent[i].replace("@", ""));
                        }
                    }
                }

                var post = new Post();
                post._id = post_id;
                post.user = {
                    _id: user._id,
                    username: user.username,
                    name: user.name
                };
                post.location = req.body.location != null ? req.body.location : "";
                post.content = req.body.content;
                post.images = images;
                post.videos = videos;
                post.mentions = mentions;

                if(mentions.length > 0) {
                    User.find({'username': { $in: mentions }}, (error, users) => {
                        if(error) res.status(500).json({
                            status: 500,
                            error: error,
                            timestamp: Date.now()
                        });
    
                        if(users) {
                            for(let i = 0; i < users.length; i++) {
                                users[i].notifications.push({
                                    _id: create_UUID(),
                                    message: "@" + user.username + " hat einen deiner Beiträge kommentiert!",
                                    post_id: post._id,
                                    seen: false,
                                    action: false,
                                    createdAt: Date.now()
                                });

                                users[i].update({'notifications': users[i].notifications});
                            }
                        }
                    });
                }

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
    } else {
        res.status(400).json({
            status: 400,
            error: {
                code: "INVALID_BODY",
                message: "No content could be found in the body! Required: UID"
            },
            timestamp: Date.now()
        });
    } 
});

/* POST comment post */
router.post('/comment/add', firebase.verify, (req, res, next) => {
    if(req.body.uid && req.body.comment && req.body.username) {
        var post_id = req.body.uid;
        
        Post.findById(post_id, (error, post) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            if(post) {
                var comments = post.comments;
                if(req.body.comment.toString().length < 251) {
                    var mentions = [];
                    
                    var splitComment = req.body.comment.split(" ");
                    for(let i = 0; i < splitComment; i++) {
                        if(splitComment[i].startsWith("@")) {
                            if(splitComment[i].length > 5) {
                                mentions.push(splitComment[i].replace("@", ""));
                            }
                        }
                    }

                    comments.push({
                        _id: create_UUID(),
                        user: {
                            uid: req.decodedToken.uid,
                            username: req.body.username
                        },
                        comment: req.body.comment,
                        mentions: mentions,
                        createdAt: Date.now()
                    });

                    post.update({'comments': comments}, (error) => {
                        if(error) {
                            res.status(500).json({
                                status: 500,
                                error: error,
                                timestamp: Date.now()
                            });
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: "Successfully added comment",
                                comments: comments
                            });
                        }
                    });
                } else {
                    res.status(403).json({
                        status: 403,
                        error: {
                            code: "COMMENT_TOO_LONG",
                            message: "The comment is too long. Length: " + req.body.comment.length + "; max. length: " + 251 + ";"
                        },
                        timestamp: Date.now()
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
    } else {
        res.status(400).json({
            status: 400,
            error: {
                code: "INVALID_BODY",
                message: "No content could be found in the body! Required: UID, USERNAME, COMMENT"
            },
            timestamp: Date.now()
        });
    }
});

/* POST comment */
router.post('/comment/delete', firebase.verify, (req, res, next) => {
    if(req.body.comment_id && req.body.post_id) {
        var comment_id = req.body.comment_id;
        var post_id = rq.body.post_id;

        Post.findById(post_id, (error, post) => {
            if(error) res.status(500).json({
                status: 500,
                error: error,
                timestamp: Date.now()
            });

            if(post) {
                var comments = post.comments;

                if(comments.length > 0) {
                    if(comments.some(e => e._id == comment_id)) {
                        comments = comments.filter((object) => {return object._id == comment_id});

                        // success
                        res.status(200).json({
                            status: 200,
                            message: "Successfully removed comment from post",
                            timestamp: Date.now()
                        });
                    } else {
                        res.status(404).json({
                            status: 404,
                            error: {
                                code: "COMMENT_NOT_FOUND",
                                message: "No comment could be found with the id: " + comment_id,
                                post_id: post_id 
                            },
                            timestamp: Date.now()
                        });
                    }
                } else {
                    res.status(404).json({
                        status: 404,
                        error: {
                            code: "COMMENT_NOT_FOUND",
                            message: "No comment could be found with the id: " + comment_id,
                            post_id: post_id 
                        },
                        timestamp: Date.now()
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
    } else {
        res.status(400).json({
            status: 400,
            error: {
                code: "INVALID_BODY",
                message: "No content could be found in the body! Required: COMMENT_ID, POST_ID"
            },
            timestamp: Date.now()
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

module.exports = router;