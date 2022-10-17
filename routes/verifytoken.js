 const jwt = require('jsonwebtoken');

 const verifyToken = (req, res, next) => {
     try {

         const authToken = req.headers.token.split(' ')[1];
         if(authToken) {
             jwt.verify(authToken,process.env.JWT_SEC, (err, user) => {
                 if(err) return res.status(401).json('Token is not valid!')
                 req.user = user
                 next()
                })
            } else {
                return res.status(401).json('You are not authenticated')
            }
        } catch(err) {
            return res.status(500).json('Can\'t read property of token')

        }
 }

 const verifyTokenAndAuthorization = (req,res, next) => {
     verifyToken(req,res, () => {
         if(req.user.id === req.params.id || req.user.isAdmin) {
             next()
         } else {
            return res.status(403).json('You are not authorized')
         }
     })
 }

 const verifyTokenAndAdmin = (req,res, next) => {
     verifyToken(req,res, () => {
         if(req.user.isAdmin) {
             next()
         } else {
            return res.status(403).json('You are not authorized')
         }
     })
 }

 module.exports = {verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin}