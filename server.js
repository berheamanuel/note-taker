// import express.js
const express = require('express');
// import file system
const fs = require('fs');
// Import built-in Node.js package 'path' to resolve path of files that are located on the server
const path = require('path');
// // Helper method for generating unique ids
const uniqid = require("uniqid");


// assigning port
const PORT = process.env.PORT || 3001;

// Initialize an instance of Express.js
const app = express();

// Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET Route for homepage
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// Get route which reads the db.json file and sends back the parsed JSON data
app.get('/api/notes', (req, res) => {
    fs.readFile('db/db.json', 'utf8', (err, data) => {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
      console.log(jsonData);
    });
});





  // Listen for connections
app.listen(PORT, () =>
console.info(`App listening at http://localhost:${PORT}`)
);

