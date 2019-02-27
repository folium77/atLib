# atLib

## 仕様

* Node.js
* React

## 機能

* openBDから書籍情報を取得、国会図書館のAPIから「日本十進分類」を取得してMongoDBに登録
* 登録した情報をReactで一覧表示
* 登録した情報をもとに自宅の本棚を整理

## DBサンプル

```json
{"_id":"5c736729bb7e941a088996a9","isbn":"9784622087212","title":"中国はここにある","author":"梁鴻","author_kana":"リアンホン","publisher":"みすず書房","pub_date":"2018-09-25T15:00:00.000Z","cover":"https://cover.openbd.jp/9784622087212.jpg","ndl9":"611.922214","category":"農業経済","post_date":"2019-02-25T03:55:21.266Z"},
```
