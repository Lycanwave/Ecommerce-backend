const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
    let token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
    return token;
};

module.exports = generateRefreshToken;
