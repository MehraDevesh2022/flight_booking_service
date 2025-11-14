const {AppError, ErrorResponse} = require("../utils");
const {StatusCodes} = require("http-status-codes");


const validateCreateBooking  = (req , res, next) =>{

    const idempotnecyKey  = req.headers['idempotency-key'];
    const errorMessage  = "Something went wrong while creating booking"
    if(!idempotnecyKey){ 
        ErrorResponse.message = errorMessage;
        ErrorResponse.error = new AppError(["Idempotency key is required"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({...ErrorResponse});
    }else if(!req.body.flightId){
        ErrorResponse.message = errorMessage;
        ErrorResponse.error = new AppError(["Flight ID is required"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({...ErrorResponse});
    }else if(!req.body.userId){
        ErrorResponse.message = errorMessage;
        ErrorResponse.error = new AppError(["User ID is required"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({...ErrorResponse}); 
    }else if(!req.body.noOfSeats){
        ErrorResponse.message = errorMessage;
        ErrorResponse.error = new AppError(["No of seats is required"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({...ErrorResponse});
    }else if(req.body.noOfSeats <= 0){
        ErrorResponse.message = errorMessage;
        ErrorResponse.error = new AppError(["No of seats must be greater than 0"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({...ErrorResponse});
    }
    
    next();
}

function paymentMiddleware(req, res, next) {
    const idempotencyKey = req.headers['idempotency-key'];
    const errorMessage = "Something went wrong while making payment please try again later."
    if (!idempotencyKey) {
        ErrorResponse.messgae = errorMessage;
        ErrorResponse.error = new AppError(["Idempotency key is required."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse });
    }
    if (!req.body.bookingId) {
        ErrorResponse.message = errorMessage;;
        ErrorResponse.error = new AppError(["Booking id is required to make payment."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse });
    }
    if (!req.body.totalPrice || Number(req.body.totalPrice) <= 0) {
        ErrorResponse.message = errorMessage;
        const message  = req.body.totalPrice <= 0 ? "Price must be greater than zero." : "Price is required to make payment."
        ErrorResponse.error = new AppError(message, StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse });
    }
    next();

}


module.exports = {validateCreateBooking , paymentMiddleware}