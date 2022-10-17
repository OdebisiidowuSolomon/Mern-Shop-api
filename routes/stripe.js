require('dotenv').config()
const router = require("express").Router();
const stripe = require('stripe')(process.env.STRIPE_KEY)

 router.post('/payment', (req, res) => {
     stripe.charges.create({
         source: req.body.tokenId,
         amount: req.body.amount,
         currency: 'usd',
     }, (err, success) => {
         if(err) {
             return res.status(500).json(err)
            } else {
             return res.status(200).json(success)
         }
     })
 })

module.exports = router;
