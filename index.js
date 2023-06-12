const express = require('express');
const session = require('express-session');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt=require('bcrypt')
const Collection = require('./mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  })
);

app.get('/', (req, res) => {
  res.render('base', { title: 'Login' });
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Signup' });
});

app.get('/home', (req, res) => {
  res.render('home');
});
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

app.post('/signup', async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      email:req.body.email,
      password: req.body.password,
      date: req.body.date,
      content: req.body.content
    };

    const existingUser = await Collection.findOne({ name: data.name });

    if (existingUser && existingUser.name === data.name) {
      return res.send('Username already exists');
    } else {
      const newUser = new Collection({
        name: data.name,
        email:data.email,
        password: data.password,
        dates: [{ date: data.date, content: data.content }]
      });

      await newUser.save();

      req.session.user = newUser;

      res.render('base');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.post('/login', async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      email:req.body.email,
      password: req.body.password,
      date: req.body.date,
      content: req.body.content
    };

    const user = await Collection.findOne({ name: data.name });

    if (!user) {
      return res.send('Invalid username or password');
    }
    
    if (data.email !== user.email) {
      return res.send('Incorrect Email');
    }     
    if (data.password !== user.password) {
      return res.send('Invalid username or password');
    }
    const existingDateIndex = user.dates.findIndex(
      (dateObj) => dateObj.date === data.date
    );
    console.log(existingDateIndex,"existing")

    if (existingDateIndex !== -1) {
      res.render('replace-date', { user, date: data.date, content: data.content });
    } else {
      user.dates.push({ date: data.date, content: data.content });
      await user.save();

      req.session.user = user;

      res.render('home');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.send('Internal Server Error');
  }
});


app.post('/replace-date', async (req, res) => {
  try {
    const userId = req.body.userId;
    const date = req.body.date;
    const content = req.body.content;

    const user = await Collection.findById(userId);

    if (!user) {
      return res.send('User not found');
    }

    const existingDateIndex = user.dates.findIndex(
      (dateObj) => dateObj.date === date
    );
console.log(existingDateIndex,"existing")

    if (existingDateIndex !== -1) {
      user.dates[existingDateIndex].content = content;
      await user.save();
    }

    res.render('home');
  } catch (error) {   
    console.error('Error logging in:', error);
    res.send('Internal Server Error');
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vigilaakennedy@gmail.com',
    pass: 'gmhekehkmchvybtw'
  }
});

app.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email,"forgot-password")

    const user = await Collection.findOne({ email });

    if (!user) {
      return res.send('Email address not found');
    }

    
    const resetUrl = `http://localhost:3000/reset-password`;
    const mailOptions = {
      from: 'vigilaakennedy@gmail.com', 
      to: email,
      subject: 'Password Reset Instructions',
      text: `Please click on the following link to reset your password: ${resetUrl}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset instructions:', error);
        return res.send('Failed to send password reset instructions');
      }

      console.log('Password reset instructions sent:', info.response);
      res.send('Password reset instructions sent to your email');
    });
  } catch (error) {
    console.error('Error sending password reset instructions:', error);
    res.send('Internal Server Error');
  }
});

app.get('/reset-password', async (req, res) => {
 
    res.render('reset-password');

});

app.post('/reset-password', async (req, res) => {
  try {   
    const data = {
      
      email:req.body.emailName,
      password: req.body.resetpassword,
     
    };
    console.log(data,"get")
    const user = await Collection.findOne({
     email:data.email   
    });

    const newPassword =  await req.body.resetpassword;
    console.log('np',newPassword)
  
    if (!user) {
      return res.send('Invalid or expired reset token');
    }

   
    user.password = newPassword;
  
    await user.save();

    console.log('Password reset successful');
    res.redirect('/')

    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.send('Internal Server Error');
  }
});



app.listen(3000, () => {
  console.log('Server started on port 3000 http://localhost:3000/');
});

