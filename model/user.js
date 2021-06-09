const mongoose = require("mongoose");
const schema = mongoose.Schema;

const UserSchema = new schema({
    user_id: {
        type: String,
        require: true
    },
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        require: true
    },
    phone_number: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    pin: {
        type: String,
        require: true
    },
    salt: {
        type: String,
        require: true
    },
    balance: {
        type: Number,
        require: true
    },
    created_date: {
        type: Date,
        default:Date.now
    },
    updated_date: {
        type: Date,
        default:Date.now
    }
})

module.exports = User = mongoose.model("User",UserSchema,'users');