var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.getStats = (filePath) => {
  const stats = fs.statSync(filePath);
  const times = {
    createTime: stats.birthtimeMs,
    modifiedTime: stats.mtimeMs
  };

  return times;
};

exports.makeTextString = (text, {createTime, modifiedTime}) => {
  return `${text}\n${createTime}\n${modifiedTime}`;
};

exports.create = (text) => {
  return new Promise((resolve, reject) => {
    counter.getNextUniqueId()
      .then((id) => {
        var filePath = (exports.dataDir + `/${id}.txt`);
        const times = {
          createTime: Date.now(),
          modifiedTime: null
        };
        fs.writeFileAsync(filePath, exports.makeTextString(text, times))
          .then(() => {
            resolve({ id, text });
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// exports.create = (text, callback) => {
//   var id = counter.getNextUniqueId((err, id) => {
//     var filePath = (exports.dataDir + `/${id}.txt`);
//     fs.writeFile(filePath, text, (err) => {
//       if (err) {
//         callback (new Error ('error creating file'));
//       } else {
//         callback(null, { id, text });
//       }
//     });
//     // items[id] = text;
//   });
// };

exports.readAll = () => {
  return new Promise((resolve, reject) => {
    fs.readdirAsync(exports.dataDir)
      .then((listOfFileNames) => {
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
              // console.log('text: ', data[i]);
              result.push({id: data[i + offset], text: data[i].split('\n')[0]});
            }
            resolve(result);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// exports.readAll = (callback) => {
//   // getting a list of all the filenames
//   fs.readdir(exports.dataDir, (err, listOfFileNames) => {
//     if (err) {
//       callback( new Error ('error retrieving all todos'));
//     } else {
//       var idArr = [];
//       var promiseArr = _.map(listOfFileNames, (fileName) => { // '00001.txt', '00002.txt', etc
//         let value = fs.readFileAsync(exports.dataDir + `/${fileName}`, 'utf8');
//         idArr.push(fileName.slice(0, -4)); // 00001, 00002, etc. This takes the '.txt' off the fileName
//         return value;
//       });
//       var offset = promiseArr.length;
//       var concatedArr = promiseArr.concat(idArr);

//       Promise.all(concatedArr)
//         .then(data => {
//           var result = [];
//           for (let i = 0; i < offset; i++) {
//             result.push({id: data[i + offset], text: data[i]});
//           }
//           callback(null, result);
//         });
//     }
//   });
// };


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

exports.readOne = (id) => {
  return new Promise((resolve, reject) => {
    var filePath = (exports.dataDir + `/${id}.txt`);
    fs.readFileAsync(filePath, 'utf8')
      .then((text) => {
        resolve({ id, text: text.split('\n')[0] });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// exports.readOne = (id, callback) => {
//   var filePath = (exports.dataDir + `/${id}.txt`);
//   fs.readFile(filePath, 'utf8', (err, text) => {
//     if (err) {
//       callback(err);
//     } else {
//       callback(null, { id, text });
//     }
//   });
// };

exports.update = (id, text) => {
  return new Promise((resolve, reject) => {
    var filePath = (exports.dataDir + `/${id}.txt`);
    fs.openAsync(filePath)
      .catch((err) => {
        reject(err);
      })
      .then(() => {
        const times = exports.getStats(filePath);
        times.modifiedTime = Date.now();
        return fs.writeFileAsync(filePath, exports.makeTextString(text, times));
      })
      .then(() => {
        resolve({ id, text });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// exports.update = (id, text, callback) => {
//   var filePath = (exports.dataDir + `/${id}.txt`);
//   // Included fs.open to implement the logic of checking if a file
//   // with that id exists already, and then conditionally open that file. This ensures
//   // that we only create a file when the test wants us to.
//   fs.open(filePath, (err) => {
//     if (err) {
//       callback(new Error('Cannot update something that does not exist'));
//     } else {
//       fs.writeFile(filePath, text, (err) => {
//         if (err) {
//           callback(new Error(`No item with id: ${id}`));
//         } else {
//           callback(null, { id, text });
//         }
//       });
//     }
//   });
// };

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    var filePath = (exports.dataDir + `/${id}.txt`);
    fs.unlinkAsync(filePath)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// exports.delete = (id, callback) => {
//   var filePath = (exports.dataDir + `/${id}.txt`);
//   fs.unlink(filePath, (err) => {
//     if (err) {
//       callback(err);
//     } else {
//       callback();
//     }
//   });
// };

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
