const express = require('express');
const app = express();
const func = require('./function.js');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017/";

app.get('/', (req, res) => {

  const isbn = req.query.isbn;

  func.getBookInfo(isbn)
    .then((result) => {
      return func.getBookNDC(isbn, result);
    })
    .then((result) => {
      res.send(result);
      func.insertDb(result);
    })
    .catch((err) => {
      console.log('通信エラーです');
    });

});

app.listen(3000);
console.log('Server running at http://localhost:3000/');