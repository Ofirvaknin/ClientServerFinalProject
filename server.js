const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const encryption = require("./encryption");
const email = require("./email");
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


// Routing 
app.get('/sign-up', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/register.html'));
})

app.get('/sign-in', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/login.html'));
})

app.get('/forgot-password', async (req, res) => {
  res.sendFile(path.resolve(__dirname + '/forgot-password.html'));
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.sendFile(path.resolve(__dirname + '/404.html'));
});

// End Routing 

app.post('/sign-up', async (req, res) => {
  try {
    client = null;
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

  client = await pool.connect();
 
  // hash the password
  const hashedPassword = encryption.encrypt(inputPassword);
  console.log(hashedPassword);
  // insert to db
  text = 'insert into users(email,firstName,lastName,password) values($1,$2,$3,$4)'
  values = [inputEmail, firstName, lastName, hashedPassword]

  client.query(text, values, (err, resu) => {
    if (err){
      console.log(err);
      // show message to user?
    }
    else{
       // send confirmation email to the user
      message = "Hello " + firstName + ", Thank you for signing up!"
      emailRes = email.sendEmail(inputEmail, 'SignUp Confirmation', message);
      res.redirect('/sign-in');
    }
  })
  
  client.release();

  } catch (error) {
    if (client != null){
      client.release();
    }
    // something went wrong message
  }
  
});

app.post('/forgot-password', async (req, res) => {
  try {
    client = null;
    // Get user information 
    let inputEmail = req.body.inputEmail;

    //find the user in the data base and return his password
    client = await pool.connect();
    text = "Select email, firstName, password from users where email = $1";
    values = [inputEmail]

    client.query(text,values, (err, resu) => {
      if (err){
        console.log(err);
        // show message to user?
        res.send("Something went wrong please try again");
      }
      else{
        if (resu.rows.length == 0) {
          // no such email - need to show error
          res.send("No such email in the database.");

        }
        else{
          // send confirmation email to the user
          encryptedPassword = resu.rows[0].password;
          decryptedPassword = encryption.decrypt(encryptedPassword);
          message = "Hello " + resu.rows[0].firstname + ", your password is: " + decryptedPassword;
          console.log(message);

          email.sendEmail(inputEmail, 'Password recovery', message);
          res.redirect('/sign-in');
        }
      }
    })
  } catch (error) {
    if (client != null){
      client.release();
    }
    res.send("Something went wrong please try again");
  }
});


app.listen(port, () => {
  console.log('App listening on port %d!', port);
});




