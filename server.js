const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const db = require("./config/keys").mongoURI;

require('dotenv').config()


const log = require('./utils/console_log')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

mongoose
    .connect(db,{
        useUnifiedTopology: true,
        useNewUrlParser: true
      })
    .then(() => console.log("mongoDB Connected"))
    .catch((err) => console.log(err));

const port = process.env.PORT;

app.get('/', (req,res) => {
    res.send('<h1>Hello World!</h1>')
})

const {
    userRouter,
    transactionRouter
} = require('./routers')
app.use("",userRouter)
app.use("",transactionRouter)



app.listen(port, () => log.info(`🚀 server is ready http://localhost:${port}`))