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
const checkJwt = require('./src/utils/check.jwt');

app.engine('html', require('ejs').renderFile);
app.get('/', (req, res)=>{
    res.render('login.html',{ title:'login page'});
})

app.get('/home', (req, res)=>{  //, [checkJwt.decryptApiKey]
    // if(req.currentUser){
       return  res.render('home.html',{ title:'Add Availability'});
    // }
   // return res.status(400).json({success: false, message:'Invalid Access'});
})
app.get('/getAvailability', (req, res)=>{
    res.render('getAvailability.html',{ title:'Get Availability',result:[{startTime:'1', endTime:'2'}]});
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

//app.use("/version/", configureRoutesVersion1(app));
require('./src/versions/version1')(app);

app.listen(port, ()=>{
 console.log(`Server running on ...port:${port}`);
})
