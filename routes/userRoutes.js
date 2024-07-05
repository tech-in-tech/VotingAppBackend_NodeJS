const express = require('express');
const router = express.Router();
const User = require("./../models/user.model");
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// ? post route to add a User
router.post('/signup', async (req, res) => {
  try {
    const data = req.body; // ! assuming the request body contains the user data
    //! Create newUser document using the Mongoose model
    const newUser = new User(data);

    // !save the new user to the data base
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