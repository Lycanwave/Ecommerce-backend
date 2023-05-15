const mongoose = require("mongoose");

const dbConnect = () => {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("connection Successfull");
        })
        .catch((error) => {
            console.log("error", error);
        });
};

module.exports = dbConnect;
