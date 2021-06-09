const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const User = require('../model/user')
const utils = require('../utils/helper')


async function register(req,res){
    let first_name = req.body.first_name
    let last_name = req.body.last_name
    let phone_number = req.body.phone_number
    let address = req.body.address
    let pin = req.body.pin

    try {
        
        User.findOne({phone_number: phone_number})
        .then(async user => {
            if(user){
                return res.status(400).json({code:400, status:'FAILED', message: 'Phone number already registered'});
            }else{

                let hashed = await utils.hashPin(pin)
                const newUser = new User({
                    first_name: first_name,
                    last_name: last_name,
                    phone_number: phone_number,
                    address: address,
                    user_id: uuidv4(),
                    balance: 0,
                    pin: hashed["hash"],
                    salt: hashed["salt"]
                });
                
                newUser.save()
                    .then(user => {
                        let result = {}
                        result.user_id = user["user_id"]
                        result.first_name = user["first_name"]
                        result.last_name = user["last_name"]
                        result.phone_number = user["phone_number"]
                        result.address = user["address"]
                        result.created_date = moment(user["created_date"]).format('YYYY-MM-DD HH:mm:ss')
                        return res.status(200).json({code:200, status:'SUCCESS', message:result });
                    })
                    .catch(err => console.log(err))
            }
        })
        
    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Request is failed'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}

async function login(req,res){
    let phone_number = req.body.phone_number
    let pin = req.body.pin

    try{

        User.findOne({phone_number: phone_number})
        .then(async user => {
            if(!user){
                return res.status(400).json({code:400, message: 'Phone number and pin doesn’t match'});
            }else{
                
                let actual_pin = user["pin"]
                let pin_validation = await utils.comparePin(pin,actual_pin)

                if(!pin_validation){
                    return res.status(400).json({code:400, message: 'Phone number and pin doesn’t match'});
                }

                const payload = {
                    phone_number:phone_number,
                    user_id: user["user_id"]
                }

                let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                    algorithm: "HS256",
                    expiresIn: process.env.ACCESS_TOKEN_LIFE
                })
            
                let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
                    algorithm: "HS256",
                    expiresIn: process.env.REFRESH_TOKEN_LIFE
                })

                let result = {}
                result.access_token = accessToken
                result.refresh_token = refreshToken

                return res.status(200).json({code:200, status:'SUCCESS', result:result});
            }
        })
       

    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Request is failed'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}

async function update(req,res){
    const jwt_token = req.header('jwt_token')
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const address = req.body.address

    try{

        if (!jwt_token){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        }

        let payload = await jwt.verify(jwt_token, process.env.ACCESS_TOKEN_SECRET)
        
        if(!payload){
            return res.status(400).json({code:400, message: 'Unauthenticated'});
        } else {
            User.findOne({phone_number: payload["phone_number"]})
            .then(async user => {
                User.updateOne({phone_number: user["phone_number"]},{$set:{first_name:first_name,last_name:last_name,address:address}})
                .then(async user => {
                    User.findOne({phone_number: payload["phone_number"]})
                    .then(async user => {
                        let result = {}
                        result.user_id = user["user_id"]
                        result.first_name = user["first_name"]
                        result.last_name = user["last_name"]
                        result.address = user["address"]
                        result.updated_date = moment(user["updated_date"]).format('YYYY-MM-DD HH:mm:ss')
            
                        return res.status(200).json({code:200, status:'SUCCESS',result:result});
                    })
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        }
    } catch (err) {
        if(err.code === undefined){
            err.code = 400;
            err.message = 'Request is failed'
        }
        res.status(err.code).json({code:err.code, message:err.message})
    }
}

module.exports = {
    register,
    login,
    update
}