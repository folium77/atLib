const express = require('express');
const server = express();
const path = require('path');
const func = require('./function.js');

// correspond Express and React
server.use(express.static(path.join(__dirname, 'build')));

server.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//Get book data
server.get('/api', (req, res) => {
  func.selectDb(req, res);
});

//Posted book data
server.get('/post', (req, res) => {
  func.postedBook(req, res);
});

//Deleting book data
server.get('/delete', (req, res) => {
  func.deleteDb(req, res);
});

server.listen(3000);
console.log('Server running at http://localhost:3000/');