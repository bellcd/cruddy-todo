var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id = counter.getNextUniqueId((err, id) => {
    var filePath = (exports.dataDir + `/${id}.txt`);
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        callback (new Error ('error creating file'));
      } else {
        callback(null, { id, text });
      }
    });
    // items[id] = text;
  });
};

exports.readAll = (callback) => {
  // getting a list of all the filenames
  fs.readdir(exports.dataDir, (err, listOfFileNames) => {
    if (err) {
      callback( new Error ('error retrieving all todos'));
    } else {
      var idArr = [];
      var promiseArr = _.map(listOfFileNames, (fileName) => { // '00001.txt', '00002.txt', etc
        let value = fs.readFileAsync(exports.dataDir + `/${fileName}`, 'utf8');
        idArr.push(fileName.slice(0, -4)); // 00001, 00002, etc. This takes the '.txt' off the fileName
        return value;
      });
      var offset = promiseArr.length;
      var concatedArr = promiseArr.concat(idArr);

      Promise.all(concatedArr)
        .then(data => {
          var result = [];
          for (let i = 0; i < offset; i++) {
            result.push({id: data[i + offset], text: data[i]});
          }
          callback(null, result);
        });
    }
  });
};

// [promise1, promise2, promise3]
// [id1, id2, id3]
// [promise1, promise2, promise3, id1, id2, id3]
// [text1, text2, text3, id1, id2, id3]
// [{text: text1, id: id1}, {text: text1, id: id1}, ...]
// make promise array
// make id array
// calculate length of promise array, save as offset
// concat promise array with id array
// call promise.all with concatted array
// in .then after promise.all
// map new array of correctly structured objects from each pair of resolved promise / id
// callback with new array

exports.readOne = (id, callback) => {
  var filePath = (exports.dataDir + `/${id}.txt`);
  // readFile has a 'utf8' argument because readFile defaults to null, so in
  // order to work with it as a string the uft8 argument has to be included
  fs.readFile(filePath, 'utf8', (err, text) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  var filePath = (exports.dataDir + `/${id}.txt`);
  // Included fs.open to implement the logic of checking if a file
  // with that id exists already, and then conditionally open that file. This ensures
  // that we only create a file when the test wants us to.
  fs.open(filePath, (err) => {
    if (err) {
      callback(new Error('Cannot update something that does not exist'));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var filePath = (exports.dataDir + `/${id}.txt`);
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
