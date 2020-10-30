var express = require('express');
const firebase = require('../../firebase/firebase');
const User = require('../../models/user');
var router = express.Router();

// Cache
var userCache = [];
var lastUpdate = 0;

/* GET ranking. */
router.get('/ranking', firebase.verify, function(req, res, next) {
    // ?number="10" || optional: ?from="" ?to=""
    let number = req.query.number != null && req.query.number >= 15 ? req.query.number : 15;
    let limitation = false;

    if(lastUpdate >= (Date.now() + 1000*60*3)) {
        if(req.query.to != null && req.query.from != null) {
            if(req.query.from < req.query.to) {
                if(req.query.from > 0 && req.query.to > 1) {
                    number = req.query.to;
                    limitation = true;
                }
            }
        }
        User.find({})
        .sort({'leveling.points': 1})
        .limit(number)
        .then((users) => {
            users.forEach((user) => {
                userCache.push({
                    "_id": user._id,
                    "username": user.username,
                    "name": user.name,
                    "leveling": {
                        "level": user.leveling.level,
                        "points": user.leveling.points,
                        "pointsForNextLevel": user.leveling.pointsForNextLevel
                    },
                    "verified": user.verified
                });
            });
            lastUpdate = Date.now();

            if(limitation) userCache.splice(0, req.query.from);

            res.status(200).json({
                status: 200,
                users: userCache,
                timestamp: Date.now()
            });
        })
        .catch((error) => {if(error) res.status(500).json({error: {code: "SERVER", message: "database error"}})});
    } else {
        res.status(200).json({
            status: 200,
            users: userCache,
            timestamp: Date.now()
        });
    }
});

module.exports = router;
