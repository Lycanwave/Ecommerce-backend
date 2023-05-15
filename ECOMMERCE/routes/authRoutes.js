const express = require("express");
//const loginUser = require("../controllers/userCtrl");
const {
    createUser,
    loginUser,
    getallUser,
    getaUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    logOut,
    updatePassword,
    handleRefreshToken,
    forgetPasswordToken,
    resetPassword,
} = require("../controllers/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/forget-password-token", forgetPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.get("/allUsers", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logOut);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/:id", deleteUser);
router.put("/password", authMiddleware, updatePassword);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

module.exports = router;
