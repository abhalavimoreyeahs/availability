const { Router } = require("express");
const router = Router();
const AuthController =  require ("../controller/version1/auth.controller");

  router.post("/signup",  AuthController.signup);

  router.post("/login",  AuthController.login);

  module.exports = router;
