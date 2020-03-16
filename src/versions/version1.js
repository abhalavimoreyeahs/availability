const express = require("express");
const configureAuthRoutes = require('../routes/auth.routes');
const configureUserRoutes = require('../routes/user.routes');
const configureAvailabilityRoutes = require('../routes/availability.routes');

module.exports = function (app) {
  app.use('/version1/', [
    configureUserRoutes,
    configureAuthRoutes,
    configureAvailabilityRoutes
  ]);
};