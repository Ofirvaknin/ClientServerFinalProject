const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const encryption = require("./encryption");
var path = require("path");
const port = process.env.PORT || 8080;

const app = express();
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: "postgres://smprvwmazhrpbe:f52ddf3506636a2e2292f0d0874f518cea40b31d9fc17029d62bb21f1f9e5ea7@ec2-34-253-116-145.eu-west-1.compute.amazonaws.com:5432/d1kc5ldhcql7j4",
  ssl: {
    rejectUnauthorized: false
  }
})
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/sign-up', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/register.html'));
})

app.get('/sign-in', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/login.html'));
})

app.post('/sign-up', async (req, res) => {
  try {
    // Get user information 
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let inputEmail = req.body.inputEmail;
  let inputPassword = req.body.inputPassword;
  let repeatPassword = req.body.repeatPassword;

  if(inputPassword != repeatPassword){
    // needs to show error
    return;
  }
  //Handle chapta

  const client = await pool.connect();
 
  // hash the password
  const hashedPassword = encryption.encrypt(inputPassword)

  // insert to db
  text = 'insert into users(email,firstName,lastName,password) values($1,$2,$3,$4)'
  values = [inputEmail, firstName, lastName, hashedPassword]
  
  client.query(text, values, (err, resu) => {
    if (err){
      console.log(err);
      // show message to user?
    }
    else{
      res.redirect('/sign-in');
    }
  })
  
  client.release();
  // send confirmation email to the user

  } catch (error) {
    client.release();

    // something went wrong message
  }
  
})


app.listen(port, () => {
  console.log('App listening on port %d!', port);
});




