const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifytoken");
const CryptoJS = require("crypto-js");
const User = require("../models/User");

const router = require("express").Router();

router.put("/:id", verifyTokenAndAuthorization, (req, res, next) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.JWT_SEC
    ).toString();
    User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((user) => {
        console.log("done");
        user.save().then(() => res.status(200).json(user));
      })
      .catch((err) => res.status(500).json(err));
  }
});

router.delete("/:id", verifyTokenAndAuthorization, (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json("User Deleted");
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// GET A USER
router.get("/find/:id", verifyTokenAndAdmin, (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      const { password, ...others } = user._doc;

      res.status(200).json(others);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
  const query = req.params.new;
  try {
    const users = query
      ? await User.find().sort({ id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get User Stats

router.get("/stats", verifyTokenAndAdmin, async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([{ $match: { createdAt: { $gte: lastYear } } }, {
        $project: {
            month: {$month: '$createdAt'}
        }
    }, {
        $group: {
            _id: '$month',
            total: {$sum: 1}
        }
    }]);

    res.status(200).json(data)

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
