// firebase admin
var admin = require('firebase-admin');
var serviceAccount = null // SERVICEACCOUNT

// authentication
function verify(req, res, next) {
    if(req.headers.authorization != null) {
      admin.auth().verifyIdToken(req.headers.authorization)
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
    } else {
      res.status(401).json({
        status: 401,
        error: {
          code: "MISSING_HEADER",
          message: "No authorization header found"
        },
        timestamp: Date.now()
      });
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
