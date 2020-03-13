const { Router } = require("express");
const UserController  =  require("../controller/version1/user.controller");
// import { checkJwt } from "../middlewares/checkJwt";

export default () => {
  const userController = new UserController();
  const router = Router();
//   router.post("/login", authController.login);
//   router.post("/changePassword", [checkJwt], authController.changePassword);
//   router.post("/ForgetPassword", authController.forgotPassword);
  return router;
};