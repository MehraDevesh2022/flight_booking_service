const CrudRepository = require("./crud-repository");
const { AppError } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const { Booking } = require("../models");


class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }


    async getBooking(booking_id, transaction) {
        try {
            const res = await Booking.findByPk(booking_id, { transaction });
            if (!res) {
                throw new AppError([`booking not available with this id ${booking_id}`], StatusCodes.NOT_FOUND);
            }
            return res;
        } catch (error) {
            throw error;
        }


    }


    async updateBooking(booking_id, status, transaction) {
        try {
            const booking = await Booking.findByPk(booking_id, { 
                lock: true,
                transaction
             });

           if(!booking){
            throw new AppError([`booking not available with this id ${booking_id}`], StatusCodes.NOT_FOUND);

           }

           booking.status = status;
           await booking.save({ transaction });
           return booking;

        } catch (error) {
            throw error;
        }
    }





}


module.exports = BookingRepository;


