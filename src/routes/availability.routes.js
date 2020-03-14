const { Router } = require("express");
const router = Router();
const AvailabilityController  =  require("../controller/version1/availability.controller");
// import { checkJwt } from "../middlewares/checkJwt";
router.post("/addAvailability",  AvailabilityController.addAvailability);
router.get("/getAvailability",  AvailabilityController.getAvailability);

module.exports = router;