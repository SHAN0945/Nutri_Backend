// middleware/authMiddleware.js

const authMiddleware = (req, res, next) => {
    console.log('Session:', req.session); // Debug: Log session data
    console.log('Cookies:', req.cookies); // Debug: Log cookies
    
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: Please log in first' });
    }

    next();
};

module.exports = authMiddleware;
