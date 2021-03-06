'use strict';

const Transform = require('stream').Transform;
const util = require('util');
const os = require('os');

/**
 * A Transform Stream that takes JSON objects and turns them into credential strings
 * @param {object} options [Transform Stream Options]{@link https://nodejs.org/docs/latest-v5.x/api/stream.html#stream_new_stream_transform_options}
 */
function JSONToCredential (options) {
  options = Object.assign({ objectMode: true }, options);
  if (!(this instanceof JSONToCredential)) {
    return new JSONToCredential(options);
  }

  Transform.call(this, options);
}

util.inherits(JSONToCredential, Transform);

JSONToCredential.prototype._transform = function JSONToCredentialTransform (chunk, encoding, done) {
  this.push(this.chunkToArray(chunk).join(os.EOL));
  done();
};

/**
 * Takes a chunk of data and turns it into an array of lines. If a profile is incomplete (i.e. if lines.length % numLinesInProfile !== 0)
 * then it is stored to be combined with the next chunk of data
 * @param  {object} data        The json representation of the credentials to store
 * @return {Array<string>}      An array of strings, each entry representing a line from the credentials file.
 */
JSONToCredential.prototype.chunkToArray = function JSONToCredentialChunkToArray (data) {
  // if only I didnt have to support node 4 :'(
  const result = Object.keys(data).reduce((memo, key) => {
    if (key === 'name') {
      return memo;
    }
    return memo.concat(`${key} = ${data[key]}`);
  }, [`[${data.name}]`]);

  result.push(''); // adds a new line below a profile
  return result;
};

module.exports = JSONToCredential;
