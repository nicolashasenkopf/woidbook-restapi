// firebase admin
var admin = require('firebase-admin');
var serviceAccount = require('./firebase_admin/woidbook-b76ba-firebase-adminsdk-a2do8-83f6884202.json');

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

// Initialize
function load() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = {
    verify,
    load,
    admin
}