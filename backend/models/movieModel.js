const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  id: String,
  status: {
    type: String,
    enum: ['non', 'picked', 'booked'],
    default: 'non',
  },
  row: Number,
  col: Number,
});

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    studio: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    seats: [[seatSchema]],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);
