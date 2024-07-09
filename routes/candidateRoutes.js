const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidate.model');
const { truncate } = require('lodash');

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === 'admin') {
      return true;
    }
  } catch (err) {
    return false;
  }
}

// !Post method to add candidates
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }
    const data = req.body; //* Assuming the request body contain the candidate data

    // * create a new User document using the Mongoose model
    const newCandidate = new Candidate(data);
    // * save the new user to the database
    const response = await newCandidate.save();
    console.log("data save");
    res.status(200).json({ response: response });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
})


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }
    const candidateID = req.params.candidateID; //* Extract the id from the URL parameter
    const updatdCandidateData = req.body  //* update data from the person

    const response = await Person.findByIdAndUpdate(candidateID, updatdCandidateData, {
      new: true, //* return the updated document
      runValidators: true //* Run the Mongoose validation
    })
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log('candidate data updated');
    res.status(200).json(response)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "INTERNAL" });
  }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }
    const candidateID = req.params.candidateID; //* Extract the id from the URL parameter

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log('candidate Deleted');
    res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
})



// !Let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async(req, res) => {
  // * no Admin can votr
  // * user can only vote one
  
  candidateID = req.params.candidateID;
  userId = req.user.id;
  try {
    // * find the candidate document with th especified candidateID
    const candidate = await Candidate.findById(candidateID)
    if (!candidate) {
      return res.status(404).json({message:"Candidate not found"});
    }
    
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"user not found"});
    }
    
    if(user.isVoted){
      return res.status(404).json({message:"You have already voted"});
    }
    
// !Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OGQ2NTQyODg1MzMwYTAxNGUxMDhmMSIsImlhdCI6MTcyMDU0MjUzMCwiZXhwIjoxNzIwNTcyNTMwfQ.yP1qChFJXr_BBS1-tWejLJ_mSLxaeJsb3_qmkZD0_ic"

    if(user.role == "admin"){
      res.status(403).json({message:"admin is not allowed"});
    }
    // *update  the candidate document to record the vote
    candidate.votes.push({user:userId})
    candidate.voteCount++;
    await candidate.save();
    // * Update the user document
    user.isVoted = true;
    await user.save();
    res.status(200).json({message:'Vote recorded successfully'});
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"INTERNAL SERVER ERROR"});
  }
})

// ! Vote count
router.get('/vote/count', async (req, res) => {
  try{
      // *Find all candidates and sort them by voteCount in descending order
      const candidate = await Candidate.find().sort({voteCount: 'desc'});

      // *Map the candidates to only return their name and voteCount
      const voteRecord = candidate.map((data)=>{
          return {
              party: data.party,
              count: data.voteCount
          }
      });

      return res.status(200).json(voteRecord);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});

//! Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
  try {
      // *Find all candidates and select only the name and party fields, excluding _id
      const candidates = await Candidate.find({}, 'name party -_id');

      // *Return the list of candidates
      res.status(200).json(candidates);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;