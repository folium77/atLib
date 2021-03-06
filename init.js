const request = require('superagent');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = "mongodb://127.0.0.1:27017/";
const cat = require('./category.json');

MongoClient.connect(dbUrl, (err, db) => {
  if (err) throw err;
  const dbo = db.db('atlib');
  const obj = cat;
  dbo.collection('books').createIndex({isbn: 1}, {unique: true});
  dbo.collection('categories').insert(obj , (err, res)  => {
    if (err) throw err;
    db.close();
  });
});