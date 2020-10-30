var express = require('express');
var router = express.Router();
var firebase = require('../../firebase/firebase');
const Path = require('path');

// Cache
var usernameCache = [];

// path
var base_path = "https://api.woidbook.com";

// models
var Post = require('../../models/post');
var User = require('../../models/user');

/* POST create user model */
router.post('/create', firebase.verify, (req, res, next) => {
  if(req.body.startLetters.length != 0) {
    User.find({"username": req.body.username.toLowerCase(), "email": req.body.email, "_id": req.body.uid}, (error, users) => {
      if(error) res.status(500).json({
        status: 500,
        error: error,
        timestamp: Date.now()
      });

      if(users.length == 0) {
        var user = new User();
        user._id = req.body.uid;
        user.username = req.body.username.toLowerCase();
        user.name = req.body.name;
        user.email = req.body.email;
        user.startLetters = req.body.startLetters;
        user.options.privacy.private = false;
        user.createdAt = Date.now();
        user.lastConnection = Date.now();

        user.save((error) => {
          if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
          });
        });

        usernameCache = usernameCache.filter(value => value.value == req.body.username.toLowerCase());

        res.status(200).json({
          status: 200,
          user: user,
          message: "Successfully added user to database",
          timestamp: Date.now()
        });
      } else {
        res.status(403).json({
          status: 403,
          error: {
            code: "USERNAME_ALREADY_USED",
            message: "This username is already used",
          },
          timestamp: Date.now()
        });
      }
    });
  }
});

router.post('/profile/image', firebase.verify, (req, res, next) => {
  function isValid(file) {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'application/octet-stream') {
        return true;
    }
    return false;
  }

  if(req.files != null) {
    if(req.files.images != null) {
      if(isValid(req.files.images)) {
          var filename = req.decodedToken.uid + Path.extname(req.files.images.name);
          req.files.images.mv('./public/user/images/' + filename, (error) => {
              if(error) {
                  return;
              }
          });

          var path = base_path + "/user/images/" + filename;
          res.status(200).json({
            status: 200,
            imageURL: path,
            timestamp: Date.now()
          });
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
});

router.get('/:username/available', (req, res, next) => {
  var username = req.params.username.toLowerCase();

  var cache = usernameCache.filter(e => e.value == username);
  if(cache.length != 0) {
    if(cache.find(obj => obj.value == username).state == false) {
      res.status(200).json({
        status: 200,
        state: true,
        message: "This username is available",
        username: cache.value,
        timestamp: Date.now()
      });
    } else {
      res.status(200).json({
        status: 200,
        state: false,
        message: "This username is NOT available",
        username: cache.value,
        timestamp: Date.now()
      });
    }
  } else {
    User.findOne({"username": username}, (error, user) => {
      if(error) res.status(500);

      if(user) {
        res.status(200).json({
          status: 200,
          state: false,
          message: "This username is NOT available",
          username: cache.value,
          timestamp: Date.now()
        });

        usernameCache.push({value: username, state: true});
      } else {
        res.status(200).json({
          status: 200,
          state: true,
          message: "This username is available",
          username: cache.value,
          timestamp: Date.now()
        });

        usernameCache.push({value: username, state: false});
      }

    })
  }
});

/* GET userdata */
router.get('/data', firebase.verify, function(req, res, next) {
  User.findById(req.decodedToken.uid, (error, user) => {
    if(error) res.status(500).json({
      status: 500,
      error: error,
      timestamp: Date.now()
    });

    if(user) {
      res.status(200).json({
        status: 200,
        user: user,
        timestamp: Date.now()
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
});

/* GET Notifications */
router.get('/notifications', firebase.verify, (req, res, next) => {
  User.findById(req.decodedToken.uid, (error, user) => {
    if(error) res.status(500).json({error: {code: "SERVER", message: "Database error"}});

    res.status(200).json({
      status: 200,
      notifications: user.notifications,
      timestamp: Date.now()
    });

    let updated = false;
    if(user.notifications.length > 0) {
      for(let i = 0; i < user.notifications.length; i++) {
        if(user.notifications[i].seen == false) {
          user.notifications[i].seen = true;
          updated = true;
        }
      }
    }

    if(updated) user.update({'notifications': user.notifications}, (error) => {if(error) res.status(500).json({error: {code: "SERVER", message: "Database error"}})});
  });
});

/* GET profiledata */
router.get('/:uid/profile', firebase.verify, (req, res, next) => {
  var uid = req.params.uid;

  User.findById(uid, (error, user) => {
    if(error) res.status(500).json({
      status: 500,
      error: error,
      timestamp: Date.now()
    });

    if(user) {
      // check if user is in blocked list
      if(!user.blocked.includes(req.decodedToken.uid)) {
        Post.find({'user._id': user._id}).sort({'createdAt': -1}).limit(40).then((posts) => {
          res.status(200).json({
            _id: user._id,
            username: user.username,
            name: user.name,
            follower: user.follower.filter((obj) => obj.type != "REQUEST"),
            followed: user.followed,
            leveling: {
              level: user.leveling.level,
              points: user.leveling.points
            },
            posts: posts,
            stories: user.stories,
            verified: user.verified,
            options: {
              privacy: user.options.privacy,
              information: {
                birthday: user.options.privacy.birthday == true ? user.options.information.birthday : null,
                town: user.options.privacy.town == true ? user.options.information.town : null,
                description: user.options.information.description,
                region: user.options.information.region
              }
            }
          });
        });
      } else {
        // return if blocked
        res.status(403).json({
          status: 403,
          error: {
            code: "BLOCKED_BY_USER",
            message: "You are blocked by the user with the following uid: " + uid
          },
          name: user.name,
          username: user.username,
          timestamp: Date.now()
        });
      }
    } else {
      // return if not found
      res.status(404).json({
        status: 404,
        error: {
          code: "NO_USER_FOUND",
          message: "No user could be found with the following uid: " + uid
        },
        timestamp: Date.now()
      });
    }
  });
});

/* POST edit e-mail */
router.post('/email/edit', firebase.verify, (req, res, next) => {
  if(req.body.email) {
    var email = req.body.email;

    User.findOne({'email': email}, (error, searched) => {
      if(error) res.status(500).json({
        status: 500,
        error: error,
        timestamp: Date.now()
      });

      if(!searched) {
        User.findById(req.decodedToken.uid, (error, user) => {
          if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
          });
    
          if(user) {
            if(email != user.email) {
              user.update({'email': email}, (error) => {
                if(error) {
                  if(error) res.status(500).json({
                    status: 500,
                    error: error,
                    timestamp: Date.now()
                  });
                } else {
                  res.status(200).json({
                    status: 200,
                    message: "Successfully changed email to: " + email,
                    timestamp: Date.now()
                  });
                }
              })
            } else {
              res.status(403).json({
                status: 403,
                error: {
                  code: "SAME_EMAIL",
                  message: "This email is already used!"
                },
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
        });
      } else {
        res.status(403).json({
          status: 403,
          error: {
            code: "SAME_EMAIL",
            message: "This email is already used!"
          },
          timestamp: Date.now()
        });
      }
    });
  }
});

/* POST un/follow */
router.post('/follow', firebase.verify, (req, res, next) => {
  var uid = req.body.uid;

  User.findById(uid, (error, user) => {
    if(error) res.status(500).json({
      status: 500,
      error: error,
      timestamp: Date.now()
    });

    if(user) {
      // check if user is in follower list
      if(user.follower.some(e => e.uid == req.decodedToken.uid)) {
        user.follower = user.follower.filter((object) => {return object.uid != req.decodedToken.uid});

        user.update({'follower': user.follower}, (error) => {if(error) console.error(error)});

        User.findById(req.decodedToken.uid, (error, sender) => {
          if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
          });

          if(sender) {
            sender.followed = sender.followed.filter((object) => {return object.uid != uid});

            sender.update({'followed': sender.followed}, (error) => {if(error) console.log(error)});
          }
        })

        res.status(200).json({
          status: 200,
          type: "UNFOLLOWED",
          message: "Successfully unfollowed user: " + uid,
          timestamp: Date.now()
        });
      } else {
        User.findById(req.decodedToken.uid, (error, sender) => {
          if(error) res.status(500).json({
            status: 500,
            error: error,
            timestamp: Date.now()
          });

          if(sender) {
            // check if user isn't private
            if(user.options.privacy.private == false) {
              // Add follower to follower list
              user.follower.push({
                type: "ACCEPTED",
                uid: req.decodedToken.uid,
                username: sender.username,
                createdAt: Date.now()
              });

              user.notifications.push({
                _id: create_UUID(),
                user: {
                  _id: sender._id,
                  username: sender.username
                },
                message: "@" + sender.username + " folgt dir nun!",
                seen: false,
                action: false,
                createdAt: Date.now()
              });

              // Add user to followed list
              sender.followed.push({
                type: "REQUESTED",
                uid: user._id,
                username: user.username,
                createdAt: Date.now()
              });

              // Update database
              user.update({'follower': user.follower, 'notifications': user.notifications}).then(() => {
                sender.update({'followed': sender.followed}, (error) => console.log(error));
              });

              res.status(200).json({
                status: 200,
                type: "ACCEPTED",
                message: "Successfully followed user: " + uid,
                timestamp: Date.now()
              });
            } else {
              user.follower.push({
                type: "REQUEST",
                uid: req.decodedToken.uid,
                username: req.body.username,
                createdAt: Date.now()
              });

              user.notifications.push({
                message: "@" + sender.username + " möchte dir folgen!",
                seen: false,
                action: true,
                createdAt: Date.now()
              });

              user.update({'follower': user.follower, 'notifications': user.notifications}, (err) => console.error(err));

              res.status(200).json({
                status: 200,
                message: "Successfully sent follower request to: " + uid,
                timestamp: Date.now()
              });
            }
          } else {
            res.status(404).json({
              status: 404,
              error: {
                code: "NO_USER_FOUND",
                message: "FATAL!! The sender couldn't be found: " + uid
              },
              timestamp: Date.now()
            });
          }
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
  });
});

/* POST update information option */
router.post('/options/information/update', firebase.verify, (req, res, next) => {
  if(req.body != null) {
    User.findById(req.decodedToken.uid, (error, user) => {
      if(error) res.status(500).json({
        status: 500,
        error: error,
        timestamp: Date.now()
      });

      if(user) {
        const information = {
          birthday: req.body.birthday,
          description: req.body.description,
          region: req.body.region,
          town: req.body.town
        }

        user.options.information = information;

        user.update({'options': user.options}, (err) => console.error(err));

        res.status(200).json({
          status: 200,
          message: "Successfully changed options (information)",
          timestamp: Date.now()
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
    })
  }
});

/* POST update notifications option */
router.post('/options/notifications/update', firebase.verify, (req, res, next) => {
  if(req.body != null) {
    User.findById(req.decodedToken.uid, (error, user) => {
      if(error) res.status(500).json({
        status: 500,
        error: error,
        timestamp: Date.now()
      });

      if(user) {
        const notifications = {
          comments: req.body.comments,
          level: req.body.level,
          likes: req.body.likes,
          mentions: req.body.mentions,
          requests: req.body.requests
        }

        user.options.notifications = notifications;

        user.update({'options': user.options});

        res.status(200).json({
          status: 200,
          message: "Successfully changed options (notifications)",
          timestamp: Date.now()
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
    })
  }
});

/* POST update privacy option */
router.post('/options/privacy/update', firebase.verify, (req, res, next) => {
  if(req.body != null) {
    User.findById(req.decodedToken.uid, (error, user) => {
      if(error) res.status(500).json({
        status: 500,
        error: error,
        timestamp: Date.now()
      });

      if(user) {
        const privacy = {
          comments: req.body.comments,
          birthday: req.body.birthday,
          likes: req.body.likes,
          town: req.body.town,
          private: req.body.private
        }

        user.options.privacy = privacy;

        user.update({'options': user.options}, (err) => console.error(err));

        res.status(200).json({
          status: 200,
          message: "Successfully changed options (privacy)",
          timestamp: Date.now()
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
    })
  }
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
