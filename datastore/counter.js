const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;
const Promise = require('bluebird');

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(exports.counterFile, (err, fileData) => {
      if (err) {
        // console.log('err: ', err);
        // how to handle err of file not found, so set default counter value to 0, separate from other errors??

        // return here closes execution of the callback invocation. We don't actually care about the return value
        return reject(err);
      }
      resolve(Number(fileData));
    });
  });
};

// const readCounter = (callback) => {
//   fs.readFile(exports.counterFile, (err, fileData) => {
//     if (err) {
//       callback(null, 0);
//     } else {
//       callback(null, Number(fileData));
//     }
//   });
// };

const writeCounter = (counterString) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(exports.counterFile, counterString, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(counterString);
      }
    });
  });
};

// const writeCounter = (counterString, callback) => {
//   // var counterString = zeroPaddedNumber(count);
//   fs.writeFile(exports.counterFile, counterString, (err) => {
//     if (err) {
//       // throw ('error writing counter');
//       callback(new Error ('error writing counter'), null);
//     } else {
//       callback(null, counterString);
//     }
//   });

// using and returning Pomises
exports.getNextUniqueId = () => {
  return new Promise((resolve, reject) => {
    readCounter()
      .then((number) => {
        // console.log('number: ', number);
        return writeCounter(zeroPaddedNumber(++number));
      })
      .then((paddedNumberId) => {
        // console.log('paddedNumberId: ', paddedNumberId);
        resolve(paddedNumberId);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// exports.getNextUniqueId = (callback) => {
//   var id = null;

//   readCounter((err, number) => {
//     id = number;
//     ++id;
//     var paddedNumberId = zeroPaddedNumber(id);
//     writeCounter(paddedNumberId, (err, data) => {
//       if (err) {
//         callback(err, null);
//       } else {
//         callback(null, paddedNumberId);
//       }
//     });
//   });
// };



// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
