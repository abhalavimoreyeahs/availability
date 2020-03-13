const express = require('express');
require('dotenv').config()
const path = require('path');
const app = express();

const port = process.env.PORT || 8081;
const bodyParser = require('body-parser');
const cors = require('cors');
const multipart = require('connect-multiparty');
require('./src/db/mongodb'); // Mongo db connection
const configureRoutesVersion1 = require('./src/versions/version1');

app.engine('html', require('ejs').renderFile);
app.get('/', (req, res)=>{
    res.render('home.html');
})
app.use(cors());
app.options('*', cors());
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
})

app.use(multipart());
app.use(bodyParser.json({extend: true, limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use("/version/", configureRoutesVersion1())

app.listen(port, (data)=>{
 if(data) console.log(`Server running on ...port:${port}`);
 else console.log('Unable to run server');
})
