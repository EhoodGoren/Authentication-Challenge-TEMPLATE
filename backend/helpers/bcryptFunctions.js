const bcrypt = require('bcrypt');
const saltRounds = 10;

async function encrpytPassword(password) {
    return await bcrypt.hash(`${password}`, saltRounds);
}

async function checkDecrypt(password, hash) {
    return await bcrypt.compare(`${password}`, `${hash}`);
}

module.exports = {
    encrpytPassword,
    checkDecrypt
}
