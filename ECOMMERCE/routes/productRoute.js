const express = require("express");
const {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productCtrl");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/getallproduct", getAllProduct);
router.get("/:id", getaProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
