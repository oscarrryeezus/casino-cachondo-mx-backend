const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const morgan = require('morgan')

require("dotenv").config();

const URL_CONNECT = process.env.URL_CONNECT;
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.disable('x-powered-by');

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(URL_CONNECT)

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('error on connect to database: ', error)
})

db.once('open', () => {
    console.log('connection successfully'); 
    app.use(cors());
    app.use('/api', require('./router/index.js'));
    app.listen(PORT, () => {
        console.log(`server mounted on port: ${PORT}`);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('server error :(');
});

module.exports = app;