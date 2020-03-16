const mongoose = require('mongoose');
let database_URL = process.env.Database_URL;

const env = process.env.NODE_ENV || 'developement'
if (env === 'development') {
    database_URL = 'mongoodb://localhost:27017/Availability';
}

mongoose.connect(database_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => { console.log('Mongo Server Connected Successfully ... !', database_URL); },
    (err) => { console.log('Failed to connect to MongoDB: ', err.message); } /** Handle Initial connection error*/
);

// schema registered here
require('../model/users.model');
require('../model/availability.model');