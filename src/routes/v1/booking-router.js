const express = require("express");
const router = express.Router();
const {BookingController} = require("../../controllers");
const {BookingMiddleware} = require("../../middlewares");


router.post("/" , BookingMiddleware.validateCreateBooking, BookingController.createBooking);

router.post("/payment" , BookingMiddleware.paymentMiddleware ,BookingController.makePayment);



module.exports = router


