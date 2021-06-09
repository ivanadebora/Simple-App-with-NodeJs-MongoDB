const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const kue = require('kue')
const Transaction = require('../model/transaction')
const utils = require('../utils/helper')

// const queue = kue.createQueue()

async function topup(req,res){
    const jwt_token = req.header('jwt_token')
    const amount = req.body.amount

    let balance_before = 0
    let balance_after = 0
    try {

        if (!jwt_token){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        }

        let payload = await jwt.verify(jwt_token, process.env.ACCESS_TOKEN_SECRET)
       
        if(!payload){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        } else{
            
            User.findOne({phone_number: payload["phone_number"]})
            .then(async user => {
                balance_before = user["balance"],
                balance_after = balance_before + amount
                const newTopUp = new Transaction({
                    top_up_id: uuidv4(),
                    status: "SUCCESS",
                    user_id: user["user_id"],
                    transaction_type: "CREDIT",
                    amount: amount,
                    remark:"",
                    balance_before: balance_before,
                    balance_after: balance_after
                });
                newTopUp.save()
                .then(async trans => {
                   
                        await User.updateOne({phone_number: user["phone_number"]},{$set:{balance:balance_after}},function(err, res) {
                            if (err) throw err;
                            console.log(res)
                            console.log("1 document updated")

                            let result = {}
                            result.top_up_id = trans["top_up_id"]
                            result.amount_top_up = trans["amount"]
                            result.balance_before = trans["balance_before"]
                            result.balance_after = trans["balance_after"]
                            result.created_date = moment(trans["created_date"]).format('YYYY-MM-DD HH:mm:ss')
                            console.log(result)
                            return res.status(200).json({code:200, status:'SUCCESS', message:result });
                        })
                })
                .catch(err => console.log(err))
            })
        }
    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Unauthenticated'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}

async function payment(req,res){
    const jwt_token = req.header('jwt_token')
    const amount = req.body.amount
    const remark = req.body.remark

    let balance_before = 0
    let balance_after = 0
    try {

        if (!jwt_token){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        }

        let payload = await jwt.verify(jwt_token, process.env.ACCESS_TOKEN_SECRET)
        
        if(!payload){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        } else{
            
            User.findOne({phone_number: payload["phone_number"]})
            .then(async user => {
                if(user["balance"] < amount){
                    return res.status(400).json({code:400, message: 'Balance is not enough'});
                } else{
                    balance_before = user["balance"],
                    balance_after = balance_before - amount
                    const newPayment = new Transaction({
                        payment_id: uuidv4(),
                        status: "SUCCESS",
                        user_id: user["user_id"],
                        transaction_type: "DEBIT",
                        amount: amount,
                        remark: remark,
                        balance_before: balance_before,
                        balance_after: balance_after
                    });
                    
                    newPayment.save()
                    .then(async trans => {
                      
                            await User.updateOne({phone_number: user["phone_number"]},{$set:{balance:balance_after}},function(err, res) {
                                if (err) throw err;
                                console.log(res)
                                console.log("1 document updated")
                            })
            
                            let result = {}
                            result.payment_id = trans["payment_id"]
                            result.amount = trans["amount"]
                            result.remark = trans["remark"]
                            result.balance_before = trans["balance_before"]
                            result.balance_after = trans["balance_after"]
                            result.created_date = moment(trans["created_date"]).format('YYYY-MM-DD HH:mm:ss')
                            
                            return res.status(200).json({code:200, status:'SUCCESS', message:result });
                    })
                    .catch(err => console.log(err))
                }
            })
        }
    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Unauthenticated'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}

async function transfer(req,res){
    const jwt_token = req.header('jwt_token')
    const target_user = req.body.target_user
    const amount = req.body.amount
    const remark = req.body.remark

    let balance_before = 0
    let balance_after = 0
    let target_balance_before = 0
    let target_balance_after = 0

    try {

        if (!jwt_token){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        }

        let payload = await jwt.verify(jwt_token, process.env.ACCESS_TOKEN_SECRET)
        
        if(!payload){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        } else{
            
            User.findOne({phone_number: payload["phone_number"]})
            .then(async user => {
                if(user["balance"] < amount){
                    return res.status(400).json({code:400, message: 'Balance is not enough'});
                } else{
                    User.findOne({user_id:target_user})
                    .then(async target => {
                        target_balance_before = target["balance"]
                        target_balance_after = target_balance_before + amount
                        balance_before = user["balance"],
                        balance_after = balance_before - amount

                        await User.updateOne({user_id: target_user},{$set:{balance:target_balance_after}},function(err, res) {
                            if (err) throw err;
                            console.log(res)
                            console.log("1 document updated")
                        })
                        const newTransfer = new Transaction({
                            transfer_id: uuidv4(),
                            status: "SUCCESS",
                            user_id: user["user_id"],
                            transaction_type: "DEBIT",
                            amount: amount,
                            remark: remark,
                            balance_before: balance_before,
                            balance_after: balance_after
                        });
                        
                        newTransfer.save()
                        .then(async trans => {
                        
                                await User.updateOne({phone_number: user["phone_number"]},{$set:{balance:balance_after}},function(err, res) {
                                    if (err) throw err;
                                    console.log(res)
                                    console.log("1 document updated")
                                })
                
                                let result = {}
                                result.transfer_id = trans["transfer_id"]
                                result.amount = trans["amount"]
                                result.remark = trans["remark"]
                                result.balance_before = trans["balance_before"]
                                result.balance_after = trans["balance_after"]
                                result.created_date = moment(trans["created_date"]).format('YYYY-MM-DD HH:mm:ss')
                                
                                return res.status(200).json({code:200, status:'SUCCESS', message:result });
                        })
                        .catch(err => console.log(err))
                    })
                    .catch(err => {
                        return res.status(400).json({code:400, message: 'User Cannot Found'});
                    })
                }
            })
        }
    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Unauthenticated'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}

async function transactions(req,res){
    const jwt_token = req.header('jwt_token')

    try {

        if (!jwt_token){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        }

        let payload = await jwt.verify(jwt_token, process.env.ACCESS_TOKEN_SECRET)
        
        if(!payload){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        } else{
            
            User.findOne({phone_number: payload["phone_number"]})
            .then(async user => {
                
                Transaction.find({user_id: user["user_id"]})
                .then(async trans => {
                    let result = []
                    for(let i=0; i<trans.length; i++){
                        let obj = {}
                        obj.top_up_id = trans[i].top_up_id 
                        obj.payment_id = trans[i].payment_id 
                        obj.transfer_id = trans[i].transfer_id
                        obj.status = trans[i].status
                        obj.user_id = trans[i].user_id
                        obj.transaction_type = trans[i].transaction_type
                        obj.amount = trans[i].amount
                        obj.remark = trans[i].remark
                        obj.balance_before = trans[i].balance_before
                        obj.balance_after = trans[i].balance_after
                        obj.created_date = moment(trans[i].created_date).format('YYYY-MM-DD HH:mm:ss')

                        result.push(obj)
                    }

                    return res.status(200).json({code:200, status:'SUCCESS',result:result});
                })
                .catch(err => console.log(err))
            })
        }
    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Unauthenticated'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}


module.exports = {
    topup,
    payment,
    transfer,
    transactions
}