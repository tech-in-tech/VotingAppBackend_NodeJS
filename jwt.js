const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=>{
  // !first check request header has authorized or not
  const  authorization = res.headers.authorization;
  if(!authorization) return res.status(401).json({error:"TOKEN NOT FOUND"});

  // !extract jwt token fron the request header
  const token = res.headers.authorization.split(' ')[1];
  if(!token) res.status(401).json({error:"UNAUTHORIZED"});

  try {
    //! Verify the JWT token
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    //! Attach user information to the request object
    req.user=  decoded;
    next;
  } catch (error) {
    console.log(error);
    res.status(401).json({error:"INVALID TOKEN"});
  }
}



// ? Function to generate JWT token
const generateToken = (userData)=>{
  // !generate a new JWT token using user data
  return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:30000});
}


// !Exporting jwtAuthMiddleware and generateToken
module.exports = {jwtAuthMiddleware, generateToken};