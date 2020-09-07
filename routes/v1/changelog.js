var express = require('express');
var router = express.Router();

const rateLimit = require('express-rate-limit');
const Changelog = require('../../models/changelog');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10
});

/* GET changelog */
router.get('/get', function(req, res, next) {
  Changelog.find({}).sort({'timestamp': -1}).exec((error, changelogs) => {
    if(error) console.error(error);

    if(changelogs) {
        res.status(200).json({
            changelogs: changelogs
        });
    } else {
        res.status(404).json({
            error: {
                message: "No changelogs found"
            }
        });
    }
  });
});

module.exports = router;
