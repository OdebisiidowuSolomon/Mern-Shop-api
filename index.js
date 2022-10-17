const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const cartRoute = require("./routes/cart");
const stripeRoute = require("./routes/stripe");

dotenv.config()
app.use(express.json())
app.use(cors())

mongoose
  .connect(process.env.Mongo_url)
  .then((data) => {
    console.log("Mongodb connected");
  })
  .catch((err) => console.log(err));

  app.use('/api/auth',authRoute)
app.use('/api/users',userRoute)
app.use('/api/products',productRoute)
app.use('/api/orders',orderRoute)
app.use('/api/carts',cartRoute)
app.use('/api/checkout',stripeRoute)


app.listen(process.env.PORT || 5000, () => {
  console.log("Server Listening");
});
