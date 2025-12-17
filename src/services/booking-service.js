const { BookingRepository } = require("../repositories");
const { AppError, IdempotencyManager, BOOKING_STATUS } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const https = require("https");
const db = require("../models");

const bookingRepository = new BookingRepository();
const { FLIGHT_SERVICE_URL } = require("../config");
const idempotencyManager = new IdempotencyManager();

const { PENDING, CANCEL , BOOKED} = BOOKING_STATUS;
const EXPIRY_TIME = 15 * 60 * 1000;

const httpAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
})

const axiosInstance = axios.create({
  baseURL: FLIGHT_SERVICE_URL,
  httpsAgent: httpAgent,
  httpsAgent: httpAgent,
  timeout: 5000,
  headers: {
    connection: 'keep-alive',
  }
});



const createBooking = async (data, idempotencyKey) => {
  let seatReservation = false;
  try {
    if (idempotencyKey) {
      // temporory soltuion for now (use redis and db to store idempotency key for checking booking with existing idempotency key)
      const cachedResult = idempotencyManager.checkIdempotentKey(idempotencyKey);

      if (cachedResult.available) {
        const booking = idempotencyManager.idempotentStore.get(idempotencyKey)?.data;
        console.log(`Idempoetent request detected`, {
          idempotencyKey,
          booking
        })

        return booking;
      }

    }
    // get the flight data via flightId
    const flightData = await fetchFlight(data.noOfSeats, data.flightId)
    // reserve the seats first  Reserve Seats (Saga Step 1)
    await updateSeats(data?.noOfSeats, data?.flightId);
    seatReservation = true;
    // Create booking now  Create Booking (Saga Step 2)
    const transaction = await db.sequelize.transaction();

    try {
      const totalFlightCost = data.noOfSeats * flightData.price;

      if (totalFlightCost <= 0 || isNaN(totalFlightCost) || totalFlightCost > Number.MAX_SAFE_INTEGER) {
        throw new AppError(["Invalid total flight cost."], StatusCodes.BAD_REQUEST);
      }

      const bookingPayload = {
        flightId: data.flightId,
        userId: data.userId,
        totalCost: totalFlightCost,
        status: PENDING,
        noOfSeats: data.noOfSeats

      };
      const booking = await bookingRepository.create(bookingPayload, transaction);



      if (idempotencyKey) {
        console.log("Booking created successfully.")
        idempotencyManager.setIdempotencyKey(idempotencyKey, booking);

      }

      await transaction.commit();
      return booking;

    } catch (error) {

      // rolleback
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.log(error, "error");
    if (seatReservation) {
      try {
        // compensation: Release the seats
        await updateSeats(-data?.noOfSeats, data?.flightId);
      } catch (compensationError) {
        console.error("Crticial error: Seat compensation faild.", {
          flightId: data?.flightId,
          noOfSeats: data?.noOfSeats,
          error: compensationError.message,
          timestamp: new Date().toISOString(),
        })
        // In production, send to dead letter queue or alert system
      }
    }

    if (error instanceof AppError) {
      console.log("error is instance of AppError", error);
      throw error;
    }

    throw new AppError(["An unexpected error occurred.Please try again later"], StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const fetchFlight = async (noOfSeats, flightId) => {
  let flight;
  try {
    flight = await axiosInstance.get(`${flightId}`);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new AppError(["Flight service taking to long time please try again later"], StatusCodes.GATEWAY_TIMEOUT);
    }

    if (error.response?.status === 404) {
      throw new AppError(["Flight not found."], StatusCodes.NOT_FOUND)
    }
    throw new AppError(["Flight service unavailable."], StatusCodes.SERVICE_UNAVAILABLE);
  }

  if (!flight.data?.data) {
    console.error("Invalid flight data structure response.", {
      received: flight.data,
      expected: "{data : {id, price , totalSeats: {}}"
    })
    throw new AppError(["Flight service returned invalid data."], StatusCodes.BAD_GATEWAY);
  }

  const flightData = flight.data.data;
  if (flightData.totalSeats < noOfSeats) {
    throw new AppError(["Not enough seats available."], StatusCodes.UNPROCESSABLE_ENTITY)
  }

  return flightData;
}


const updateSeats = async (noOfSeats, flightId) => {
  try {
    await axiosInstance.patch(`${flightId}/seats`, {
      totalSeats: noOfSeats
    })

  } catch (error) {

    if (error.code === 'ECONNABORTED') {
      throw new AppError(["Flight service taking to long time please try again later"], StatusCodes.GATEWAY_TIMEOUT);
    }
    if (error.response?.status === 404) {
      throw new AppError(["Flight not found."], StatusCodes.NOT_FOUND);
    }
    if (error.response?.status === 500) {
      throw new AppError(["Flight service unavailable."], StatusCodes.SERVICE_UNAVAILABLE);
    }
    throw new AppError(["Failed to reserve the seats."], StatusCodes.UNPROCESSABLE_ENTITY)
  }
}




const cancelBooking = async (bookingId, transaction) => {
  try {
    await bookingRepository.updateBooking(bookingId, CANCEL, transaction);

  } catch (error) {
    const message = error?.message || "Failed to cancel the booking.";
    throw new AppError([message], error?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
  }
}


const makePayment = async (data, idempotentKey) => {
  const t = await db.sequelize.transaction();
  let isTransactionCommited= false;
   
   try {
    
    if (idempotentKey) {

      const exist = idempotencyManager.checkIdempotentKey(idempotentKey)
      if (exist.available) {
        const paymentData = idempotencyManager.idempotentStore.get(idempotentKey)?.data;
        console.log("Idempotent request detected.",
          idempotentKey,
          paymentData
        );
        return paymentData;
      }
    }

  

    const response = await bookingRepository.get(data.bookingId, { transaction: t });
    const booking = response?.dataValues;

    if(data.totalPrice !== booking?.totalCost){
     throw new AppError(["Total price and booking cost are not matching."], StatusCodes.BAD_REQUEST);
    }


    if(data.userId !== booking?.userId){
      throw new AppError(["User id and booking user id are not matching."], StatusCodes.BAD_REQUEST);
    }

    if (booking?.status === CANCEL) {
      throw new AppError(["Booking is already expired."], StatusCodes.BAD_REQUEST);
    } 

    const bookingTimeWindow = Date.now() - new Date(booking.createdAt.getTime());
    
    if (bookingTimeWindow >= EXPIRY_TIME) {  
      // add cancel booking and reverse the seat
         
        await cancelBooking(data?.bookingId, t);
        await t.commit(); // becasue here we updating the status so if we rollback then booking status will not set pending to the cancel
        isTransactionCommited = true
        // compensation : Release the seats 
    try {
     await updateSeats(-booking?.noOfSeats, booking?.flightId);
      } catch (compensationError) {
        console.error("Crticial error: Seat compensation faild.", {
          flightId: data?.flightId,
          noOfSeats: data?.noOfSeats,
          error: compensationError.message,
          timestamp: new Date().toISOString(),
        })
        throw compensationError
      }

      throw new AppError(["booking is expired."], StatusCodes.BAD_REQUEST);
    }
    // using the read commit + optimistic locking to update the booking status (to avoid the race condition and double charges of the same booking.)
    const res = await bookingRepository.updateBooking(data.bookingId, BOOKED, t);
    await t.commit();

    if(idempotentKey){
      console.log("Payment successfull. Idempotency key stored.")
      idempotencyManager.setIdempotencyKey(idempotentKey, res);

    }
    return res;

  } catch (error) {
 
   if(!isTransactionCommited){
    await t.rollback();
   }
    if (error instanceof AppError) {
      throw new AppError([error.message], error.statusCode);
    }
    throw new AppError([(error.message || error.explanation )||"Faild to complete payment. Try again latter."], (error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
  }
}


const cancelBookings =  async() => {
  
  try {
      const bookingWindow  = new Date(Date.now()  + 1000 + 15); // (15 min window)
     await bookingRepository.cancelBookingStatus(bookingWindow)


  } catch (error) {
    throw new AppError([error.message || "Oops somthing went went wrong"] || StatusCodes.INTERNAL_SERVER_ERROR);
  }
}


module.exports = {
  createBooking,
  makePayment,
  cancelBookings
}









// created at 

