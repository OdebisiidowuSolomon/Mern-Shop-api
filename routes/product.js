const {
  verifyTokenAndAdmin,
} = require("./verifytoken");
const Product = require("../models/Product");

const router = require("express").Router();

// CREATE Product
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE Product
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(201).json(updatedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get A Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get All Products
router.get("/", async (req, res) => {
  
  // Newest Products first
  const qNew = req.query.new;

  // Product category
    const qCategory = req.query.category;

  try {
    let products;

    if(qNew && qCategory) {
        products = await Product.find({categories: {$in: [qCategory]}}).sort().limit(5);
    } else if(qNew) {
        products = await Product.find().sort({createdAt: -1}).limit(5);
    } else if(qCategory) {
        products = await Product.find({categories: {$in: [qCategory]}});
    } else {
        products = await Product.find()
    }

    res.status(201).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete Products
router.delete("/:id", verifyTokenAndAdmin,async (req, res) => {
  try {
    const products = await Product.findByIdAndDelete(req.params.id);

    res.status(201).json("Product deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
