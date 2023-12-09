// import express.js
const express = require('express');
// import file system
const fs = require('fs');
// Import built-in Node.js package 'path' to resolve path of files that are located on the server
const path = require('path');
// // Helper method for generating unique ids
const uniqid = require('uniqid');

const util = require('util');

const readFromFile = util.promisify(fs.readFile);



// assigning port
const PORT = process.env.PORT || 3001;

// Initialize an instance of Express.js
const app = express();

// Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// Get route which reads the db.json file and sends back the parsed JSON data
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for db`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));

    // another option
    // fs.readFile('./db/db.json', 'utf8', (err, data) => {
    //     if (err) throw err;
    //     const jsonData = JSON.parse(data);
    //     console.log(jsonData);
    //     res.json(jsonData);
    // });
});

// Reads the newly added notes from the request body and then adds them to the db.json file
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeNewNote(file, parsedData);
        }
    });
};

// Writes data to db.json utilized within the readThenAppendToJson function
const writeNewNote = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    );

// Post route receives a new note, saves it to request body, adds it to the db.json file, 
// and then returns the new note to the client
app.post("/api/notes", (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title: title,
            text: text,
            id: uniqid(),
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: "success",
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Error in posting new note');
    }
});

// GET Route for notes page
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/notes.html'))    
);

// GET Route for homepage
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// Delete route reads the db.json file, uses the json objects uniqids to match the object to be deleted, 
// removes that object from the db.json file, then re-writes the db.json file
app.delete("/api/notes/:id", (req, res) => {
    console.info(`${req.method} request received for db`);
    let id = req.params.id;
    let parsedData;
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        parsedData = JSON.parse(data);
        const filterData = parsedData.filter((note) => note.id !== id);
        writeNewNote('./db/db.json', filterData);
      }
    });
    res.send(`Deleted note with ${req.params.id}`);
  });

// Listen for connections
app.listen(PORT, () =>
    console.info(`App listening at http://localhost:${PORT}`)
);

