const { AppError, ErrorResponse } = require("../utils");
const { StatusCodes } = require("http-status-codes");



const sendErrorValidation = (res, message, detail) => {
    ErrorResponse.message = message;
    ErrorResponse.error = new AppError([detail], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse });
}

const validateCreateBooking = (req, res, next) => {

    const idempotencyKey = req.headers['idempotency-key'];
    const errorMessage = "Something went wrong while creating booking"

    const bookingValidations = [
        {condition: !idempotencyKey, detail: "Idempotency key is required"},
        {condition: !req.body.flightId, detail: "Flight ID is required"},
        {condition: !req.body.userId, detail: "User ID is required"},
        {condition: !req.body.noOfSeats, detail: "No of seats is required"},
        {condition: req.body.noOfSeats <= 0, detail: "No of seats must be greater than 0"}
    ]


    for (const { condition, detail } of bookingValidations) {
        if (condition) {
            sendErrorValidation(res, errorMessage, detail);
        }

    }
    next();
}

const paymentMiddleware = (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];
    const errorMessage = "Something went wrong while making payment please try again later."

    const paymentValidations = {
        condition: !idempotencyKey, detail: "Idempotency key is required to make payment.",
        condition: !req.body.bookingId, detail: "Booking id is required to make payment.",
        condition: !req.body.totalPrice || Number(req.body.totalPrice) <= 0, detail: req.body.totalPrice <= 0 ? "Price must be greater than zero." : "Price is required to make payment."
    }

    for (const { condition, detail } of paymentValidations) {
        if (condition) {
            sendErrorValidation(res, errorMessage, detail);
        }
    }

    next();

}


module.exports = { validateCreateBooking, paymentMiddleware }





