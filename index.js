const express = require('express');
const session = require('express-session');
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
// console.log(dateObj.date,"dateobj")

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


app.listen(3000, () => {
  console.log('Server started on port 3000 http://localhost:3000');
});