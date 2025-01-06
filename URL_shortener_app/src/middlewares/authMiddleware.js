const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set();

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

const authMiddleware = () => {
    
    return (req, res, next) => {
        const token = req.header("Authorization");
        console.log("token:", token);
        // console.log();
        const path = req.originalUrl;
        console.log(req.originalUrl);
        if (!token || isTokenBlacklisted(token)) {
            return res
                .status(401)
                .json({
                    status: 401,
                    error: {}, message: "Unauthorized: No token provided"
                }); // Unauthorized or blacklisted token
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err && err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 401,
                    error: { msg: err.message },
                    message: 'Token has expired. Please log in again.'
                });
            }
            if (err && err.name === 'JsonWebTokenError') {
                return res.status(responseCode.UNAUTERIZED).json({
                    status: responseCode.UNAUTERIZED,
                    error: { msg: err.message },
                    message: 'Invalid token. Please log in again.'
                });
            }
            if (err && err.name === 'NotBeforeError') {
                return res.status(responseCode.UNAUTERIZED).json({
                    status: responseCode.UNAUTERIZED,
                    error: { msg: err.message },
                    message: 'Token is not yet valid. Please check your system clock or log in again.'
                });
            }
            if (!user) {
                return res.status(responseCode.FORBIDDEN).json({
                    status: responseCode.UNAUTERIZED,
                    error: { msg: err.message },
                    message: "Invalid Token"
                });
            }
            else {
                req.user = user;
                next();
            }
            console.log('user:',user);
            req.user = user;
        });
    };
};

module.exports = authMiddleware;
