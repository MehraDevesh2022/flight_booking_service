const {BookingService} = require("../services/index");
const {AppError , SuccessResponse , ErrorResponse} = require("../utils");
const {StatusCodes} = require("http-status-codes");




const createBooking = async(req , res) => {

  try {


    console.log("req.body", req.body);
    const idempotencyKey  = req.headers['idempotency-key'];
    const booking = await BookingService.createBooking(
      {
         flightId : req.body.flightId,
         userId : req.body.userId,
         noOfSeats : req.body.noOfSeats,
        }, idempotencyKey);
     
    return res.status(StatusCodes.CREATED).json({...SuccessResponse ,
      message: "Booking created successfully.",
      data : booking
    });


 } catch (error) {
  console.log("error", error);
    if(error instanceof AppError){
      return res.status(error.statusCode).json({
        ...ErrorResponse,
        error : {
          message : error.explanation,
          statusCode : error.statusCode
        }
       })
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      ...ErrorResponse,
       error: {
        message: ["An unexpected error occurred"],
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
      }
    })

 }
}


const makePayment = async (req , res) => {
  try {
    const idempotencyKey  = req.headers["idempotency-key"];
    const payment  = await BookingService.makePayment({
      bookingId :   req.body.bookingId,
      userId    :   req.body.userId,
      totalPrice :  req.body.totalPrice
 }, idempotencyKey);
  
    return res.status(StatusCodes.CREATED).json({
      ...SuccessResponse,
      message : ["Payment done succcessfully."],
      data : payment
    });
      
  } catch (error) {
   if(error instanceof AppError){
       return res.status(error.statusCode).json({
        ...ErrorResponse,
        error :{
         message : error.explanation,
         statusCode :error.statusCode
        }
       });
    }

    return res.status(error.statusCode ||StatusCodes.INTERNAL_SERVER_ERROR).json({
      ...ErrorResponse,
      error : {
        message : error.explanation || ["An unexpected error occurred."],
        statusCode : error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
      }
    });
  }
}


module.exports = {
    createBooking,
    makePayment
}