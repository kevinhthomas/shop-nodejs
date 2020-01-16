const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = cb => {
  MongoClient.connect()
    .then(client => {
      console.log("Connected!");
      _db = client.db("shop");
      cb();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No db set up!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
