const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlog,
    deleteBlog,
    likeBlog,
    disLikeBlog,
} = require("../controllers/blogCtrl");

const router = express();

router.post("/", authMiddleware, isAdmin, createBlog);
router.get("/", getAllBlog);
router.get("/:id", getBlog);

router.delete("/:id", authMiddleware, isAdmin, deleteBlog);
router.put("/like", authMiddleware, isAdmin, likeBlog);
router.put("/dislike", authMiddleware, disLikeBlog);
router.put("/:id", authMiddleware, updateBlog);

module.exports = router;
