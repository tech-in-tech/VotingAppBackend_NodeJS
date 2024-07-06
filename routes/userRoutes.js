const express = require('express');
const router = express.Router();
const User = require("./../models/user.model");
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// ! post route to add a User
router.post('/signup', async (req, res) => {
  try {
    const data = req.body; // * assuming the request body contains the user data
    //* Create newUser document using the Mongoose model
    const newUser = new User(data);

    // *save the new user to the data base
    const response = await newUser.save();
    console.log('data Saved');

    const payload = {
      id: response.id
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).json({ response: response, token: token });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
})

// ! Login route
router.post('/login',async(req,res)=>{
  try {
    // *Extract aadharCardNumber and password from request body
    const {aadharCardNumber,password} = req.body;
    // *find the user by aadharCardNumber
    const user = await User.findOne({aadharCardNumber:aadharCardNumber});

    // *if user does not exist or password does not match, return error
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error:"Invalid username or password"});
    }
    // *generate Token
    const payload = {
      id:user.id,  
    }
    const token = generateToken(payload);
    res.json({token})
  } catch (error) {
    console.error(err);
    res.status(500).json({error:"INTERNAL SERVER ERROR"})
  }
})

// !Profile route
router.get("/profile",jwtAuthMiddleware,async (req, res) => {
  try {
    const userData = req.user;
    const userId= userData.id;
    const user = await User.findById(userId);
    res.status(200).json({user});
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"INTERNAL SERVER ERROR"});
  }
})

// !change password 
router.put("profile/password", jwtAuthMiddleware,async(req,res)=>{
  try {
    const userId = req.user.id;   //* extract user id fron token

    const {currentPassword,newPassword} = req.body; 

    // *Find the user by userId
    const user  = await  User.findById(userId);
    // * if password does not match, return error
    if(!(await user.comparePassword(currentPassword))){
      return res.status(401).json({error:"INVALID USERNAME OR PASSWORD"})
    }
    // * update the user's password
    user.password = newPassword;
    await user.save();
    console.log("Password updated");


    res.status(200).json({message:"Password updated"});
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"INTERNAL SERVER ERROR"});
  }
})

module.exports = router;