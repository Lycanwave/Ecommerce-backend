const generateToken = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const generateRefreshToken = require("../config/refrestToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => {
    //console.log(req.body);
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email: email });
        //console.log(findUser);
        if (!findUser) {
            const newUser = await User.create(req.body);
            console.log(newUser);
            res.json({
                message: "user created Successfully",
                credentials: newUser,
            });
        } else {
            return res.send({ message: "user already exist" });
        }
    } catch (error) {
        res.send({ message: error.message });
    }
});

const loginUser = asyncHandler(async (req, res) => {
    //console.log("vsfsd");
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });
    //console.log(findUser, email, password);

    if (findUser && (await findUser.isPasswordMatched(password))) {
        //console.log(findUser?._id);
        const refreshToken = await generateRefreshToken(findUser?._id);
        //console.log(refreshToken);
        const updateUser = await User.findByIdAndUpdate(
            findUser._id,
            { refreshToken: refreshToken },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        return res.send({
            message: "Successfully Logged-In",
            userDetails: updateUser,
            token: generateToken(findUser._id),
        });
    } else {
        throw new Error("Invalid Credentials");
        //return res.send({ message: "Password not match" });
    }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    // res.send({ message: "fsdfds", cookie: cookie });

    if (!cookie?.refreshToken) throw new Error("No refresh token in Cookies");

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("Refresh token not found");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (error, decode) => {
        if (error || user.id !== decode.id)
            throw new Error("Refresh Token didnot match");

        const accessToken = generateToken(user?._id);
        res.json({
            message:
                "Access token matched successfully and created new refresh token",
            user: accessToken,
        });
    });
});

const logOut = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) throw new Error("Refres Token not found");

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            http: true,
            secure: true,
        });
        return res.status(204).send({ massage: "User not found" }); //forbidden;
    }

    await User.findOneAndUpdate(refreshToken, { refreshToken: "" });
    res.clearCookie("refreshToken", {
        http: true,
        secure: true,
    });
    console.log("user logged-out");
    res.status(204).send({ message: "User Logged-Out" });
});

const getallUser = asyncHandler(async (req, res) => {
    try {
        const allUsers = await User.find();

        res.json({ message: "all users are fetched", users: allUsers });
    } catch (error) {
        throw new Error("Problem in fetching the users");
    }
});

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const getUser = await User.findById(id);

        if (getUser) {
            res.send({ message: "User found", userDetails: getUser });
        } else {
            res.send({ message: "User not found" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getUser = await User.findByIdAndDelete(id);

        if (getUser) {
            res.send({ message: "User Deleted", deletedUserDetail: getUser });
        } else {
            res.send({ message: "User not found" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongoDbId(id);
    const data = req.user;
    try {
        const updateUser = await User.findByIdAndUpdate(
            id,
            {
                firstname: data?.firstname,
                lastname: data?.lastname,
                email: data?.email,
                mobile: data?.mobile,
            },
            { new: true }
        );
        res.json({ message: "Data Updated", UpdatedData: updateUser });
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            { isBlocked: true },
            { new: true }
        );

        res.send({ message: "User Blocked", userCredentials: block });
    } catch (error) {
        throw new Error(error);
    }
});

const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const unBlock = await User.findByIdAndUpdate(
            id,
            { isBlocked: false },
            { new: true }
        );

        res.send({ message: "User Unblocked", userCredentials: unBlock });
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgetPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this E-mail");

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`;

        const data = {
            to: email,
            text: `Hey ${user.firstname}`,
            subject: "Forgot password link",
            html: resetURL,
        };
        sendEmail(data);
        res.json({
            message: "Password reset link sent successfully",
            token: token,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error("token Expired, Please try again later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password Updated Successfully", userData: user });
});

module.exports = {
    loginUser,
    createUser,
    getallUser,
    getaUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    updatePassword,
    forgetPasswordToken,
    logOut,
    resetPassword,
};
