const mongoose = require("mongoose");
const schema = mongoose.Schema;

const TransactionSchema = new schema({
    top_up_id: {
        type: String,
        require: true
    },
    payment_id: {
        type: String,
        require: true
    },
    transfer_id: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    user_id: {
        type: String,
        require: true
    },
    transaction_type: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    remarks: {
        type: String,
        require: true
    },
    balance_before: {
        type: Number,
        require: true
    },
    balance_after: {
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

module.exports = Transfer = mongoose.model("Transaction",TransactionSchema,"transactions");