const { Router } = require("express");
const AuthController =  require ("../controller/version1/auth.controller");
// import { checkJwt } from "../middlewares/checkJwt";

// export default () => {
//   const authController = new AuthController();
//   const router = Router();
//   router.post("/signup", authController.signup);
// //   router.post("/changePassword", [checkJwt], authController.changePassword);
// //   router.post("/ForgetPassword", authController.forgotPassword);
//   return router;
// };

  router.post("/signup", [checkJwt], AuthController.signup);
  module.exports = router;
