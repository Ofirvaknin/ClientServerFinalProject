const crypto = require('crypto-js');
var key = crypto.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');

function encrypt(text) {
    var ciphertext = crypto.AES.encrypt(text, key, { mode: crypto.mode.ECB });
    return ciphertext.toString();
}

function decrypt(ciphertext) {
    var bytes  = crypto.AES.decrypt(ciphertext, key, { mode: crypto.mode.ECB });
    var originalText = bytes.toString(crypto.enc.Utf8);
    return originalText;
}
 
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;