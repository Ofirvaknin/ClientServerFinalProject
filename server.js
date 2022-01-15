const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const encryption = require("./encryption");
const email = require("./email");
var path = require("path");
var session = require('express-session');
const port = process.env.PORT || 8080;

const app = express();
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: "postgres://twviwytdgumecr:704b9ba05afdb529678955f3e0223f07515a7f41167ecdaefd1952b5a817f1c1@ec2-54-77-182-219.eu-west-1.compute.amazonaws.com:5432/da8gf7ls09bs64",
  ssl: {
    rejectUnauthorized: false
  }
})
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret:"g8g8fg8fg8fg8i", resave:false, saveUninitialized:true}));

// Routing 
app.get('/', async (req, res) => {
  //res.sendFile(path.resolve(__dirname + '/login.html'));
  if(!req.session.user){
    res.sendFile(path.resolve(__dirname + '/login.html'));  
  }
  else{
    res.redirect('/index');
  }
})
app.get('/sign-up', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/register.html'));
})

app.get('/sign-in', async (req, res) => {
  //res.sendFile(path.resolve(__dirname + '/login.html'));
  if(!req.session.user){
    res.sendFile(path.resolve(__dirname + '/login.html'));  
  }
  else{
    res.redirect('/index');
  }
})

app.get('/forgot-password', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/forgot-password.html'));
})
app.get('/index', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/index1.html'));
})

app.get('/t', async (req, res) => {
  if(!req.session.user){
    res.redirect('/sign-in');
  }
  else{
    res.redirect('/index');
  }
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.sendFile(path.resolve(__dirname + '/404.html'));
});

// End Routing 

app.post('/sign-in', async (req, res) => {
  try{
    client =null
    //Get inputs from form
    let email = req.body.inputEmail;
    let password = req.body.inputPassword;
    client = await pool.connect();
    text = "Select password from users where email = $1";
    values = [email];
    client.query(text,values, (err, resu) => {
      if (err){
        console.log(err);
      }
      else{
        if (resu.rows.length == 0) {
          // no such email - need to show error
          res.send('Wrong credientials!');
        }
        else{
          if(encryption.decrypt(resu.rows[0].password)==password){
            req.session.user = resu.rows[0];
            res.send('200');
          }
          else{
            console.log('wrong credientials');
            //message of wrong credientials
            res.send('Wrong credientials!');
          }
        }
      }
    })

  } catch (error) {
    if (client != null){
      client.release();
    }
    // something went wrong message
    res.send("Something went wrong. Please try again later.");

  }
  
});

app.post('/sign-up', async (req, res) => {
  try {
    client = null;
    // Get user information 
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let inputEmail = req.body.inputEmail;
  let inputPassword = req.body.inputPassword;
  let repeatPassword = req.body.repeatPassword;

  if (firstName == "" || lastName == "" || inputEmail == "" || inputPassword == "" || repeatPassword == "")
  {
    res.send("Please fill all the fields!");
    return;
  }
  if(inputPassword != repeatPassword){
    res.send("Passwords does not match!");
    return;
  }

  var passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

  if(!passwordPattern.test(inputPassword)){
    let string = "Password requirment: atleast 6 characters, Include a Lowercase and uppercase, Include a Number, Include a Special Character";
    res.send(string);
    return;
  }

  //Handle chapta

  client = await pool.connect();
  // hash the password
  const hashedPassword = encryption.encrypt(inputPassword);

  // insert to db
  text = 'insert into users(email, password, firstName,lastName) values($1,$2,$3,$4)'
  values = [inputEmail, hashedPassword, firstName, lastName]

  client.query(text, values, (err, resu) => {
    if (err){
      console.log(err);
      console.log(err["constraint"]);
      if (err["constraint"] == "users_pkey"){
        res.send("Email already exist. You can recover your password if you forgot it.");

      }
      else{
        res.send("Something went wrong. Please try again later.");
      }
    }
    else{
       // send confirmation email to the user
      message = "Hello " + firstName + ", Thank you for signing up!"
      emailRes = email.sendEmail(inputEmail, 'SignUp Confirmation', message);
      res.send('200');
    }
  })
  
  client.release();

  } catch (error) {
    if (client != null){
      res.send("Something went wrong. Please try again later.");
      client.release();
    }
    // something went wrong message
  }
  
});

app.post('/forgot-password', async (req, res) => {
  try {
    client = null;
    // Get user information 
    let inputEmail = req.body.InputEmail;

    //find the user in the data base and return his password
    client = await pool.connect();
    text = "Select email, firstName, password from users where email = $1";
    values = [inputEmail]

    client.query(text,values, (err, resu) => {
      if (err){
        console.log(err);
        // show message to user?
        res.send("Something went wrong. Please try again later.");
      }
      else{
        if (resu.rows.length == 0) {
          // no such email - need to show error
          res.status(400).send("No such email in the database.");

        }
        else{
          // send confirmation email to the user
          encryptedPassword = resu.rows[0].password;
          decryptedPassword = encryption.decrypt(encryptedPassword);
          message = "Hello " + resu.rows[0].firstname + ", your password is: " + decryptedPassword;
          console.log(message);

          email.sendEmail(inputEmail, 'Password recovery', message);
          res.send("200");
        }
      }
    })
  } catch (error) {
    if (client != null){
      client.release();
    }
    res.send("Something went wrong. Please try again later.");
  }
});

app.listen(port, () => {
  console.log('App listening on port %d!', port);
});




