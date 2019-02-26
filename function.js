const request = require('superagent');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = "mongodb://127.0.0.1:27017/";

// 書籍情報取得
exports.getBookInfo = (isbn) => {
  const baseUrl = `https://api.openbd.jp/v1/get?isbn=${isbn}`;
  return new Promise((resolve, reject) => {
   request.get(baseUrl).end((err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res.body);
    });
  })
};

// 分類名取得
exports.getBookNDC = (isbn, data) => {
  const baseUrl = `http://iss.ndl.go.jp/api/opensearch?mediatype=1&isbn=${isbn}`;
  return new Promise((resolve, reject) => {
   request.get(baseUrl).buffer().end((err, res) => {
      if (err) {
        reject(err);
      }
      resolve(createBookInfo(data, res));
    });
  });
};

// Contributorの最初がアルファベットだったらカタカナのものを返す
const alphabetCheck = (contributors) => {
  const regex  = /^[a-zA-Z\u00C0-\u017F]+(([',\. -][a-zA-Z \u00C0-\u017F])?[',\. -][a-zA-Z\u00C0-\u017F]*)*$/g; //アルファベットの人名に一致
  const result = contributors.filter(val => {
    if ( val.PersonName.content.search(regex) === -1 && val.ContributorRole[0] === 'A01') {
      return val;
    }
  });
  return result[0];
};

// 書籍情報の配列を作成
const createBookInfo = (data, res) => {
  /*
    ・新刊はNDL9がない（国会図書館にない）場合があるので対策
    ・書影がない場合の対策（自分で入力できるようにする）
    ・フリガナが取れないものもある
  */
  const book = data[0].summary;
  const contributor = alphabetCheck(data[0].onix.DescriptiveDetail.Contributor);
  const personName = contributor.PersonName;
  const author = personName.content;
  const author_kana = (personName.collationkey) ? personName.collationkey : '';
  const pubdate = new Date(book.pubdate.replace(/^(\d{4})(\d{2})(\d{2})/,'$1/$2/$3'));
  const supplyDetail = data[0].onix.ProductSupply.SupplyDetail.Price;
  const price = (supplyDetail) ? supplyDetail[0].PriceAmount : '';
  const cat = require('./ndc9.json');
  const $ = cheerio.load(res.text);
  const ndl8 = $('dc\\:subject[xsi\\:type="dcndl:NDC8"]').eq(0).text();
  const ndl9 = $('dc\\:subject[xsi\\:type="dcndl:NDC9"]').eq(0).text();
  const ndl = (ndl9) ? ndl9 : ndl8;
  return {
    'isbn'        : book.isbn,
    'title'       : book.title,
    'author'      : author,
    'author_kana' : author_kana,
    'publisher'   : book.publisher,
    'pub_date'    : pubdate,
    'price'　　　　: price,
    'cover'       : book.cover,
    'ndl'         : ndl,
    'category'    : cat[ndl.slice(0,3)],
    'post_date'   : new Date()
  }
};

// TODO : MongoClient.connectは一回で済ますようにまとめること

exports.selectDb = (req, res) => {
  MongoClient.connect(dbUrl, (err, db) => {
    if (err) throw err;
    const dbo = db.db('atlib');
    const find = req.query;
    const sort = {post_date: -1};
    dbo.collection('books').find(find).sort(sort).toArray((err, data) => {
      if (err) throw err;
      //res.render('./index.ejs', {books: data});
      res.render('index', {books: data});
      db.close();
    });
  });
};

// INSERT DB
exports.insertDb = (data) => {
  MongoClient.connect(dbUrl, (err, db) => {
    if (err) throw err;
    const dbo = db.db('atlib');
    const dataObj = data;
    dbo.collection('books').insertOne(dataObj , (err, res)  => {
      if (err) throw err;
      db.close();
    });

    // categoryのcountを増やす
    const id = data.ndl.slice(0,3);
    const cotegoryObj = {cotegory_id: id};
    const set = {$inc: {count: 1}};
    dbo.collection('category').updateOne(cotegoryObj, set, (err, res) => {
      if (err) throw err;
      db.close();
    });
  });
};

// DELETE DB
exports.deleteDb = (isbn, ndl) => {
  MongoClient.connect(dbUrl, (err, db) => {
    if (err) throw err;
    const dbo = db.db('atlib');
    const isbnObj = {isbn: isbn};
    dbo.collection('books').deleteOne(isbnObj, (err, res) => {
      if (err) throw err;
      db.close();
    });

    // categoryのcountを減らす
    const id = ndl.slice(0,3);
    const cotegoryObj = {cotegory_id: id};
    const set = {$inc: {count: -1}};
    dbo.collection('category').updateOne(cotegoryObj, set, (err, res) => {
      if (err) throw err;
      db.close();
    });
  });
};