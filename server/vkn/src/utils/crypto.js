const MD5 = require('crypto-js/md5');
const SHA256 = require('crypto-js/sha256');

var crypto = {
    hash: password => MD5(SHA256(password).toString()).toString(),
    match: (hashedPassword, url8Password) =>
        hashedPassword === crypto.hash(url8Password),
};

module.exports = crypto;
