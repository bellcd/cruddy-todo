const fs = require('fs');
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
  fs.readdir(exports.dataDir, (err, items) => {
    if (err) {
      callback( new Error ('error retrieving all todos'));
    } else {
      var data = _.map(items, (text, id) => {
        text = text.slice(0, -4);
        id = text;
        return { id, text };
      });
      callback(null, data);
    }
  });
};

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
