const crypto = require('crypto-js/md5');

function encrypt(text) {
    //console.log("to encrypt: " + text)
    const hash = crypto(text).toString()
    //const hash = createHmac('sha256', text).digest('hex');
    return hash;
}


// function decrypt(text) {
//     //console.log("to decrypt: " + text);
//     var mykey = crypto.createDecipher(algorithm, key);
//     var mystr = mykey.update(text, 'hex', 'utf8')
//     mystr += mykey.final('utf8');
//     return mystr;
// }
 
module.exports.encrypt = encrypt;
//module.exports.decrypt = decrypt;