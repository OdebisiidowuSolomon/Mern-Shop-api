const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifytoken");
const Order = require("../models/Order");

const router = require("express").Router();

// CREATE Order
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE Order
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get User Orders
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});
//   Get All
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete Order
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json("Order deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Monthly Income

router.get("/income", verifyTokenAndAdmin, async (req, res, next) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
    const productId = req.query.pid
    try {
      const income = await User.aggregate([{ $match: { createdAt: { $gte: previousMonth }, ...(productId && {
        products: {$elemMatch: {productId}}
      }) } }, {
          $project: {
              month: {$month: '$createdAt'},
              sales: '$amount',
          }
      }, {
          $group: {
              _id: '$month',
              total: {$sum: "sales"}
          }
      }]);
  
      res.status(200).json(income)
  
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
