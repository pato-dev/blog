// check if user is authenticated using localstorage from frontend
const jwt = require('jsonwebtoken');
const User = require("../models/users");

exports.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            return res.status(400).send({ message: 'Please login to continue.' })
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        return res.status(401).send({ error: 'Please authenticate.' })
    }
}
