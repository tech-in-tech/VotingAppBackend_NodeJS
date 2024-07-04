const mongoose = require('mongoose');

// !define the person schema
const userSchema = new mongoose.Schema({
  name:{
    type:String,
    require:true
  },
  age:{
    type:Number,
    require:true
  },
  email:{
    type:String,
  },
  
  mobile:{
    type:String
  },
  address:{
    type:String,
    require:true
  },
  aadharCardNumber:{
    type:Number,
    require:true,
    unique:true
  },
  Password:{
    type:String,
    require:true
  },
  role:{
    type:String,
    enum:['voter','admin'],
    default:'voter'
  },
  isVoted:{
    type:Boolean,
    default:false
  }
})

const User = mongoose.model('User',userSchema);
module.exports = User;