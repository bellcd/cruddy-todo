const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = (callback) => {
  fs.readFile(exports.counterFile, (err, fileData) => {
    if (err) {
      callback(null, 0);
    } else {
      callback(null, Number(fileData));
    }
  });
};

const writeCounter = (counterString, callback) => {
  // var counterString = zeroPaddedNumber(count);
  fs.writeFile(exports.counterFile, counterString, (err) => {
    if (err) {
      // throw ('error writing counter');
      callback(new Error ('error writing counter'), null);
    } else {
      callback(null, counterString);
    }
  });
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  var id = null;

  readCounter((err, number) => {
    console.log('number: ', number);
    id = number;
    console.log('id after line 47: ', id);
    ++id;
    console.log('after incrementer: ', id);
    var paddedNumberId = zeroPaddedNumber(id);
    writeCounter(paddedNumberId, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, paddedNumberId);
      }
    });
  });
  // counter = counter + 1;
  // return paddedNumberId
};



// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
