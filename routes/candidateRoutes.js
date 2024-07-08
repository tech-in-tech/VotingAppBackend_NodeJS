const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); 
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate.model');

const checkAdminRole = async (userID) => {
   try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
   }catch(err){
        return false;
   }
}

// !Post method to add candidates
router.post('/',jwtAuthMiddleware,async(req,res)=>{
  try {
    if(! (await checkAdminRole(req.user.id))){
      return res.status(403).json({message:"User does not have admin role"});
    }
    const data = req.body; //* Assuming the request body contain the candidate data

    // * create a new User document using the Mongoose model
    const newCandidate = new Candidate(data);
    // * save the new user to the database
    const response = await newCandidate.save();
    console.log("data save");
    res.status(200).json({response:response});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"INTERNAL SERVER ERROR"});
  }
})


router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
  try {
    if(!checkAdminRole(req.user.id)){
      return res.status(403).json({message:"User does not have admin role"});
    }
    const candidateID = req.params.candidateID; //* Extract the id from the URL parameter
    const updatdCandidateData = req.body  //* update data from the person

    const response= await Person.findByIdAndUpdate(candidateID,updatdCandidateData,{
      new:true, //* return the updated document
      runValidators:true //* Run the Mongoose validation
    })
    if(!response){
      return res.status(404).json({error: "candidate not found"});
    }
    console.log('candidate data updated');
    res.status(200).json(response)

  } catch (error) {
    console.log(error)
    res.status(500).json({error:"INTERNAL"});
  }
})





router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
  try {
    if(!checkAdminRole(req.user.id)){
      return res.status(403).json({message:"User does not have admin role"});
    }
    const candidateID = req.params.candidateID; //* Extract the id from the URL parameter

    const response= await Candidate.findByIdAndDelete(candidateID);
    if(!response){
      return res.status(404).json({error: "candidate not found"});
    }
    console.log('candidate Deleted');
    res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({error:"INTERNAL SERVER ERROR"});
  }
})

module.exports = router;