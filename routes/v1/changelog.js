var express = require('express');
var router = express.Router();

const Changelog = require('../../models/changelog');

/* GET changelog */
router.get('/get', function(req, res, next) {
  Changelog.find({}).sort({'timestamp': -1}).exec((error, changelogs) => {
    if(error) console.error(error);

    if(changelogs) {
        res.status(200).json({
            changelogs: changelogs.reverse()
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
