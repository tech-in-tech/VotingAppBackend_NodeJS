const express= require('express')
const app = new express()
// require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json())  // req.body
const PORT  = process.env.port || 3000;

app.listen(PORT,()=>{
  console.log("Listin on port 3000");
})