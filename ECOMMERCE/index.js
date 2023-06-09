const express = require("express");
const asyncHandler = require("express-async-handler");
const bodyParser = require("body-parser");
const dbConnect = require("./config/DBconnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoutes");
const productRoute = require("./routes/productRoute");
const blogRoute = require("./routes/blogRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const morgan = require("morgan");

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use("/", (req, res) => {
//     res.send("Hello from the server side");
// });

app.use("/api/user", authRoute);
app.use("/api/product", productRoute);
app.use("/api/blog", blogRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server connected with port ${PORT}`);
});
