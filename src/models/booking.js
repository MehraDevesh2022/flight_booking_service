'use strict';
const {
  Model
} = require('sequelize');
const {ENUMS} = require('../utils');
const {PANDING, CONFIRMED, CANCELLED} = ENUMS.BOOKING_STATUS;

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
      type : DataTypes.STRING,
      allowNull: false,
    },
    totalCost: {
      type : DataTypes.NUMBER,
      allowNull: false,
    },
    noOfSeats: {
      type : DataTypes.NUMBER,
      allowNull: false,
    },
    userId: {
      type : DataTypes.STRING,
      allowNull: false,
    },
    status : {
      type : DataTypes.ENUM,
      values : [PANDING , CONFIRMED, CANCELLED],
      defaultValue : PANDING,
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};