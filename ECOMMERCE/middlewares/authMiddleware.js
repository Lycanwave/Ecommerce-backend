const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded?.id);
            req.user = user;

            next();
            //console.log(decoded);
        } catch (error) {
            throw new Error(error);
        }
    } else {
        throw new Error("There is no token attached to header");
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email: email });
    //console.log(adminUser);
    if (adminUser.role !== "admin") {
        throw new Error("You are not admin");
    } else {
        next();
    }
});

module.exports = { authMiddleware, isAdmin };
