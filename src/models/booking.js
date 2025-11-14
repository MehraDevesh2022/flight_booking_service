'use strict';
const {
  Model
} = require('sequelize');
    
const {BOOKING_STATUS} = require("../utils/index")
 const {INITIATED , PENDING , BOOKED ,CANCEL} = BOOKING_STATUS
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init({
    flightId: {
     type : DataTypes.INTEGER,
     allowNull : false
    },
    userId:{ 
      type: DataTypes.INTEGER,
       allowNull : false
    },
  status: {
    type :DataTypes.ENUM,
 values : [INITIATED , PENDING , BOOKED , CANCEL],
  defaultValue : INITIATED,
   allowNull: false
},
    noOfSeats: {
    type : DataTypes.INTEGER,
     defaultValue :1,
     validate : {
      min : 1
     },
      allowNull : false
    }

    ,
totalCost: {
  type :DataTypes.INTEGER,
   allowNull : false, 
  validate : {
    min : 0
  }
  }

  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};