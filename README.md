# atLib

日本十進分類を利用して自宅の本棚を整理するプログラム。

* openBDから書籍情報を取得、MongoDBに登録
* 国会図書館のAPIを利用して、登録した本の「日本十進分類」を取得

## DBサンプル

```json
{"_id":"5c736729bb7e941a088996a9","isbn":"9784622087212","title":"中国はここにある","author":"梁鴻","author_kana":"リアンホン","publisher":"みすず書房","pub_date":"2018-09-25T15:00:00.000Z","cover":"https://cover.openbd.jp/9784622087212.jpg","ndl9":"611.922214","category":"農業経済","post_date":"2019-02-25T03:55:21.266Z"},
```
