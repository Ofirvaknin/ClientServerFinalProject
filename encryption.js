const crypto = require('crypto-js');

function encrypt(text) {
    var ciphertext = crypto.AES.encrypt(text, '123456').toString();
    console.log(ciphertext);
    return ciphertext;
}

function decrypt(ciphertext) {
    var bytes  = crypto.AES.decrypt(ciphertext, '123456');
    var originalText = bytes.toString(crypto.enc.Utf8);
    return originalText;
}
 
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;