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

// POST to create an exercise log
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  // Find the user by ID
  const user = users.find(u => u._id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Create the exercise log entry - store the full Date object
  const exerciseLog = {
    description,
    duration,
    date: date, 
  };

  // If the user doesn't have an exercises array, create one
  if (!user.exercises) {
    user.exercises = [];
  }

  // Add the exercise log to the user's exercises
  user.exercises.push(exerciseLog);

  res.json({
    _id: user._id,
    username: user.username,
    description: exerciseLog.description,
    duration: exerciseLog.duration,
    date: exerciseLog.date.toDateString(), 
  });
})

// GET to retrieve exercise logs
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = parseInt(req.query.limit) || 0;

  // Find the user by ID
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // If the user doesn't have exercises, return an empty array
  if (!user.exercises || user.exercises.length === 0) {
    return res.json({
      username: user.username,
      count: 0,
      _id: user._id,
      log: [],
    });
  }

  // Filter exercises based on the date range
  let exercises = user.exercises;
  if (from) {
    exercises = exercises.filter(exercise => exercise.date >= from);
  }
  if (to) {
    exercises = exercises.filter(exercise => exercise.date <= to);
  }

  // Limit the number of exercises returned
  if (limit > 0) {
    exercises = exercises.slice(0, limit);
  }

  // Return the user and their exercises
  res.json({
    _id: user._id,
    username: user.username,
    count: exercises.length,
    log: exercises.map(exercise => ({
      description: exercise.description, 
      duration: exercise.duration,       
      date: exercise.date.toDateString(), 
    })),
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
