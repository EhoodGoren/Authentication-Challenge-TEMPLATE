const bcrypt = require('bcrypt');
const saltRounds = 10;

function encrpytPassword(password) {
    return bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => hash)
    });
}

function checkDecrypt(password, hash) {
    return bcrypt.compare(password, hash, (err, result) => result);
}

module.exports = {
    encrpytPassword,
    checkDecrypt
}
