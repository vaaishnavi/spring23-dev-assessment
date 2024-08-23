const jwt = require('jsonwebtoken');

// jwt authentication middleware
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization'); // get token from request headers
    if (!token) return res.status(403).json({ error: 'no token provided' }); // check if token is present

    jwt.verify(token, 'your_jwt_secret', (err, user) => { // verify token
        if (err) return res.status(403).json({ error: 'invalid token' }); // check if token is valid
        req.user = user; // add user info to request object
        next(); // proceed to next middleware or route handler
    });
};

module.exports = authenticateJWT;
