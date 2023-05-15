const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.send({
            message: "Product created successfully",
            ProductDetail: newProduct,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);

        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        //Filtering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((element) => delete queryObj[element]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        console.log(queryObj, req.query, JSON.parse(queryStr));

        let query = Product.find(JSON.parse(queryStr));

        //Sorting

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("createdAt");
        }

        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(",");

        //     findAllProduct = findAllProduct.sort((a, b) => {
        //         for (let i = 0; i < sortBy.length; i++) {
        //             let field = sortBy[i];
        //             const order = field.startsWith("-") ? -1 : 1;
        //             if (field.startsWith("-")) field = field.slice(1);
        //             if (a[field] < b[field]) return -1 * order;
        //             if (a[field] > b[field]) return 1 * order;
        //         }
        //         return 0;
        //     });
        // } else {
        //     findAllProduct = findAllProduct.sort((a, b) => {
        //         let field = "-createdAt";
        //         const order = field.startsWith("-") ? -1 : 1;
        //         if (field.startsWith("-")) field = field.slice(1);
        //         if (a[field] < b[field]) return -1 * order;
        //         if (a[field] > b[field]) return 1 * order;

        //         return 0;
        //     });
        // }

        //limiting the fields

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // if (req.query.fields) {
        //     const fields = req.query.fields.split(",");
        //     findAllProduct = findAllProduct.map((products) => {
        //         let selectedProduct = {};

        //         fields.forEach((element, ind) => {
        //             selectedProduct[element] = products[element];
        //         });
        //         return selectedProduct;
        //     });
        // } else {
        //     findAllProduct = findAllProduct.map((product) => {
        //         return { __v: product.__v };
        //     });
        // }

        //Pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        //console.log(page, limit, skip);
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount)
                throw new Error("This produc doesn't exist");
        }

        console.log(query);

        const findAllProduct = await query;

        res.send({ message: "All Products", allProd: findAllProduct });
    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = req.body.title;
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.send({
            message: "Product updated successfully",
            UpdatedData: updatedProduct,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        res.send({
            message: "Product Successfully deleted",
            deletedProd: deletedProduct,
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
};
