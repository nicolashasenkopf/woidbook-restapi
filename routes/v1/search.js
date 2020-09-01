var express = require('express');
var router = express.Router();
var firebase = require('../../firebase/firebase');

var User = require('../../models/user');

/* GET home page. */
router.get('/*', firebase.verify, function(req, res, next) {
    // http://localhost:8000/v1/search/?search=dasisteintest
    var search = decodeURI(req.query.search).trim();

    if(search.length > 1) {
        User.find({ "username" : {$regex: new RegExp(search), $options: "i"}, "name": {$regex: new RegExp(search), $options: "i"}}).limit(30).exec((err, users) => { // search in user database with the given keywords
            if(err) console.error(err); // log error
    
            if(users.length > 0) { // check if something was found
                users = users.filter((user) => user._id != req.decodedToken.uid); // remove user from users
                
                // limit the response to the minimum
                for(let i = 0; i < users.length; i++) {
                    users[i] = {
                        "_id": users[i]._id,
                        "username": users[i].username,
                        "name": users[i].name,
                        "private": users[i].options.privacy.private
                    }
                }

                if(users.length > 0) {
                    res.status(200).json({
                        status: 200,
                        results: users,
                        timestamp: Date.now()
                    })
                } else {
                    // Nothing found
                    res.status(404).json({
                        status: 404,
                        error: {
                            code: "NO_RESULTS",
                            message: "No objects found"
                        },
                        timestamp: Date.now()
                    });
                }
            } else {
                // Nothing found
                res.status(404).json({
                    status: 404,
                    error: {
                        code: "NO_RESULTS",
                        message: "No objects found"
                    },
                    timestamp: Date.now()
                });
            }
        });
    } else {
        res.status(403).json({
            status: 403,
            error: {
                code: "NOT_ENOUGH_LETTERS",
                message: "A minimum of at least 2 letters is given"
            },
            timestamp: Date.now()
        });
    }
});

module.exports = router;
