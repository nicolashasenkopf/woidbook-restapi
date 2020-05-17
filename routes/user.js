var express = require('express');
var router = express.Router();

// models
var User = require('../models/user');

// firebase admin
var admin = require('firebase-admin');
var serviceAccount = require('./firebase_admin/woidbook-b76ba-firebase-adminsdk-a2do8-83f6884202.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/* GET userdata */
router.get('/data', verify, function(req, res, next) {
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
router.get('/:uid/profile', verify, (req, res, next) => {
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

/* POST un/follow */
router.post('/:uid/follow', verify, (req, res, next) => {
  var uid = req.params.uid;

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

// authentication
function verify(req, res, next) {
  if(req.body.id_token != null) {
    auth.verifyIdToken(req.body.id_token)
      .then((decodedToken) => {
        if(decodedToken.uid != null) {
          req.decodedToken = decodedToken;
          next();
        }
      }).catch((error) => res.status(401).json({
        status: 401,
        error: error,
        timestamp: Date.now()
      }));
  }
}

module.exports = router;
