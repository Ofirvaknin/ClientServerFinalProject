const crypto = require('crypto-js/md5');

function encrypt(text) {
    const hash = crypto(text).toString()
    return hash;
}
 
module.exports.encrypt = encrypt;
