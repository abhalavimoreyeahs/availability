const { Router } = require("express");
const router = Router();
const checkJwt = require('../utils/check.jwt');
const AvailabilityController  =  require("../controller/version1/availability.controller");
// import { checkJwt } from "../middlewares/checkJwt";
router.post("/addAvailability", [checkJwt.decryptApiKey],  AvailabilityController.addAvailability);
router.get("/getAvailability",  AvailabilityController.getAvailability);//[checkJwt.decryptApiKey],

module.exports = router;