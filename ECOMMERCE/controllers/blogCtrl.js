const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { loginUser } = require("./userCtrl");

const createBlog = asyncHandler(async (req, res) => {
    console.log("fsdfds");
    try {
        const newBlog = await Blog.create(req.body);
        res.json({
            message: "Successfully created the Blog",
            blogDetails: newBlog,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, body, {
            new: true,
        });
        res.send({
            message: "Data updated successfully",
            updatedBlog: updatedBlog,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const getBlog = await Blog.findById(id).populate(["likes", "dislikes"]);
        await Blog.findByIdAndUpdate(
            id,
            { $inc: { numViews: 1 } },
            { new: true }
        );
        res.json({ message: "Blog fetched", blog: getBlog });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllBlog = asyncHandler(async (req, res) => {
    try {
        const allBlogs = await Blog.find();

        res.send({ message: "all Blog fetched", blogs: allBlogs });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedBlog = await Blog.findByIdAndDelete(id);
        res.send({
            message: "Data deleted successfully",
            updatedBlog: updatedBlog,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    //Find the blog which you want to be liked.
    const blog = await Blog.findById(blogId);
    //Find the login User.
    const loginUserId = req?.user?.id;
    //console.log(loginUserId, blogId);
    //find if the user has liked the blog.
    const isLiked = blog?.isLiked;
    //find if the user has disliked the blog.
    const alreadyDisliked = await blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    console.log(isLiked);

    if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false,
            },
            { new: true }
        );

        // res.json({ message: "User un-disliked the Blog", blog: blog });
    }

    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true }
        );
        res.json({ message: "User un-liked the Blog", blog: blog });
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            { new: true }
        );

        res.json({ message: "User Liked the Blog", blog: blog });
    }
});

const disLikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;

    const loginUserId = req?.user?.id;

    const blog = await Blog.findById(blogId);

    const alreadyLiked = await blog?.likes?.find(
        (userId) => userId.toString() === loginUserId.toString()
    );

    console.log(alreadyLiked);

    const isDisliked = blog?.isDisliked;

    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true }
        );
        // res.json({ message: "like removed from Blog", blog: blog });
    }

    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $pull: { dislikes: loginUserId }, isDisliked: false },
            { new: true }
        );

        res.send({ message: "disliked removed form Blog", blog: blog });
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $push: { dislikes: loginUserId }, isDisliked: true },
            { new: true }
        );

        res.send({ message: "like removed from blog", blog: blog });
    }
});

module.exports = {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlog,
    deleteBlog,
    likeBlog,
    disLikeBlog,
};
