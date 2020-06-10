var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase');

// models
var User = require('../models/user');

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
      // Check if user account is privat
      if(user.options.privacy.privat == true) {
        // Check if user is in follower list
        if(user.follower.some(e => e.uid === req.decodedToken.uid)) {
          res.status(200).json({
            _id: user._id,
            username: user.username,
            name: user.name,
            follower: user.follower,
            followed: user.followed,
            leveling: {
              level: user.leveling.level,
              points: user.leveling.points
            },
            posts: user.posts,
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
        // check if user is in blocked list
        if(!user.blocked.includes(req.decodedToken.uid)) {
          res.status(200).json({
            _id: user._id,
            username: user.username,
            name: user.name,
            follower: user.follower,
            followed: user.followed,
            leveling: {
              level: user.leveling.level,
              points: user.leveling.points
            },
            posts: user.posts,
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
        } else {
          // return if blocked
          res.status(403).json({
            status: 403,
            error: {
              code: "BLOCKED_BY_USER",
              message: "You are blocked by the user with the following uid: " + uid
            },
            timestamp: Date.now()
          });
        }
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
        user.follower = user.follower.filter((object) => {return object.uid == req.decodedToken.uid});

        user.update({'follower': user.follower}).then(() => {
          User.findById(req.decodedToken.uid, (error, sender) => {
            if(error) res.status(500).json({
              status: 500,
              error: error,
              timestamp: Date.now()
            });
  
            if(sender) {
              sender.followed = sender.followed.filter((object) => {return object.uid == uid});
  
              sender.update({'followed': sender.followed});
            }
          });
        });

        res.status(200).json({
          status: 200,
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
            // check if user isn't privat
            if(user.options.privacy.privat == false) {
              // Add follower to follower list
              user.follower.push({
                type: "ACCEPTED",
                uid: req.decodedToken.uid,
                username: req.body.username,
                createdAt: Date.now()
              });

              user.notifications.push({
                _id: create_UUID(),
                message: "@" + sender.username + " folgt dir nun!",
                seen = false,
                action = false,
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
                sender.update({'followed': sender.followed});
              });

              res.status(200).json({
                status: 200,
                message: "Successfully followed user: " + uid,
                timestamp: Date.now()
              });
            } else {
              user.follower.push({
                type: "SENT_REQUEST",
                uid: req.decodedToken.uid,
                username: req.body.username,
                createdAt: Date.now()
              });

              user.notifications.push({
                message: "@" + sender.username + " möchte dir folgen!",
                seen = false,
                action = true,
                createdAt: Date.now()
              });

              user.update({'follower': user.follower});

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
  if(req.body.birthday && req.body.description && req.body.region && req.body.town) {
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

        user.update({'options': user.options});

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
  if(req.body.comments && req.body.level && req.body.likes && req.body.mentions && req.body.requests) {
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
  if(req.body.comments && req.body.birthday && req.body.likes && req.body.town && req.body.privat) {
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
          privat: req.body.privat
        }

        user.options.privacy = privacy;

        user.update({'options': user.options});

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
