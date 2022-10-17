const User = require("../models/User");

const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER

router.post("/register", async (req, res) => {
  const { email, userName: username, password, confirmPassword } = req.body;


  if (password !== confirmPassword) {
    return res.status(401).json("Password has to match");
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
    return res.status(401).json("Username in use");
  }

  const emailExists = await User.findOne({ email });

  if (emailExists) {
    return res.status(401).json("Email in use");
  }

  const encrypted = CryptoJS.AES.encrypt(
    password,
    process.env.secret_key
  ).toString();

  const newUser = new User({
    email,
    username,
    password: encrypted,
  });

  newUser
    .save()
    .then((user) => {
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "1d" }
      );

      const { password, ...others } = user._doc;

      res.status(201).json({ ...others, accessToken });

      console.log(user);
      // res.status(201).json(user);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

// LOGIn

router.post("/login", (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user)
        return res.status(404).json({
          message: "No User Found with this email, check and try again",
        });
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.secret_key
      ).toString(CryptoJS.enc.Utf8);
      if (hashedPassword !== req.body.password)
        return res.status(401).json({ message: "Wrong Password!" });

      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "1d" }
      );

      const { password, ...others } = user._doc;

      res.status(200).json({ ...others, accessToken });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/cart", (req, res) => {
  const {
    cart: { products, total, quantity },
    username,
  } = req.body;


  User.findOne({ username }).then((user) => {
    user.cart = [
      {
        products,
        total,
        quantity,
      },
    ];
    user.save().then((e) => {
      return res.json({cart:user.cart})
    });
  });
});

router.get("/cart", (req, res) => {

  User.findOne({ username: req.headers.username }).then((user) => {
      return res.json({cart:user.cart})
    });
});

module.exports = router;
