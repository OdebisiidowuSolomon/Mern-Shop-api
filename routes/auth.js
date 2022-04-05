const User = require("../models/User");

const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken')

// REGISTER

router.post("/register", (req, res) => {
  const { email, username, password, confirmpassword } = req.body;

  if (password !== confirmpassword) {
    res.status(401).json("Password has to match");
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
    .then((data) => {
      console.log(data);
      res.status(201).json(data);
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
        return res
          .status(404)
          .json({
            message: "No User Found with this email, check and try again",
          });
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.secret_key
      ).toString(CryptoJS.enc.Utf8);
      if (hashedPassword !== req.body.password)
        return res.status(401).json({ message: "Wrong Password!" });

         const accessToken = jwt.sign({
             id: user._id,
             isAdmin: user.isAdmin,
         }, process.env.JWT_SEC, {expiresIn: '1d'})

      const { password, ...others } = user._doc;

      res.status(200).json({...others, accessToken});
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
