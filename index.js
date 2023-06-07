const express = require('express');
const session = require('express-session');
// const bcrypt = require('bcrypt');
const Collection = require('./mongodb');
// const { exists } = require('./mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

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



app.post('/signup', async (req, res) => {
  try {
    const data = {
      name: req.body.name,
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
        password: data.password,
        date: data.date,
        content: data.content
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
      password: req.body.password,
      date:req.body.date,
      content:req.body.content
    };
      // console.log(data.date)
    const user = await Collection.findOne({ name:data.name });
    // console.log("User:",user)
    // const loggedUser=user.dates;
    // console.log("dates of that user",user.dates.length)
    // const date = await Collection.findOne({date:data.date});
    // console.log("Date:",date)

    for(var i=0;i<user.dates.length;i++)
    console.log("Length:",user.dates.length)
    if(user&&user.dates[i].date===data.date) {
      
      {
        console.log(user.dates[i].date)
      }

      const newUser = new Collection({
        name: data.name,
        password: data.password,
        date: data.date,
        content: data.content
      });
  // console.log("New User:",newUser)
      user.dates.push({ date: data.date, content: data.content });
      await user.save();
  
      req.session.user = user;
  
      res.render('home');
    
    }
    if (!user) {
      return res.send('Invalid username or password');
    }
    if (data.password!=user.password) {
      return res.send('Invalid username or password');
    }
    else {
      
      const newUser = new Collection({
        name: data.name,
        password: data.password,
        date: data.date,
        content: data.content
      });
  // console.log("New User:",newUser)
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

app.listen(3000, () => {
  console.log('Server started on port 3000 http://localhost:3000');
});