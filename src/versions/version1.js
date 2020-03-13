const  express =  require("express");
const configureAuthRoutes = require('../routes/auth.routes');
const configureUserRoutes = require('../routes/user.routes');

module.exports = function (app) {
  app.use('/version1/', [
    configureUserRoutes,
    configureAuthRoutes,
  ]);
};