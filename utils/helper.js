const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


async function hashPin(pin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin,salt);
    console.log(salt, 'salt')
    console.log(hash, 'hash')
    return { salt, hash };
};

async function comparePin(pin,actual_pin){
    const validation = await bcrypt.compare(pin, actual_pin);
    return validation;
}


module.exports = {
    hashPin,
    comparePin
}