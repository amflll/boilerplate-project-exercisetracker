const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];
const crypto = require('crypto');

// POST to create a user
app.post('/api/users', (req, res) => {
  const newUser = req.body.username;
  const randomId = crypto.randomBytes(16).toString('hex');
  
  const user = {
    username: newUser,
    _id: randomId,
  };
  
  // Add the user to the array
  users.push(user);
  res.json(user);
});

// GET the whole array of users
app.get('/api/users', (req, res) => {
  res.json(users); 
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
