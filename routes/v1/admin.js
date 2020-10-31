var express = require('express');
const firebase = require('../../firebase/firebase');
var router = express.Router();

/* GET home page. */
router.get('/', firebase.verify, function(req, res, next) {
  res.status(200).json({
    status: 200,
    message: "Successfully sent request to admin api"
  });
});

module.exports = router;
