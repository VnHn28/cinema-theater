const Movie = require('../models/movieModel');

const generateSeats = () => {
  const arrRow = [];
  for (let i = 0; i < 15; i++) {
    const arrCollumn = [];
    const row = String.fromCharCode(i + 65);
    for (let j = 0; j < 18; j++) {
      const seatId = row + (j < 10 ? '0' + j : j);
      const objSeat = {
        id: seatId,
        status: 'non',
        row: i,
        col: j,
      };
      arrCollumn.push(objSeat);
    }
    arrRow.push(arrCollumn);
  }
  return arrRow;
};

const createMovie = async (req, res) => {
  const { title, studio, time } = req.body;

  if (!title || !studio || !time) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const existingMovie = await Movie.findOne({ studio, time });
  if (existingMovie) {
    return res.status(400).json({ message: 'This schedule is already taken for this studio.' });
  }

  const seats = generateSeats();

  const movie = new Movie({
    title,
    studio,
    time,
    seats,
  });

  try {
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMoviesByStudio = async (req, res) => {
  try {
    const movies = await Movie.find({ studio: req.params.studio });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieById = async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).json({ message: 'Movie not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const bookSeats = async (req, res) => {
  const { seats } = req.body;

  if (!seats || !Array.isArray(seats)) {
    return res.status(400).json({ message: 'Please provide an array of seats to book.' });
  }

  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    for (const seat of seats) {
      const { row, col } = seat;
      if (
        row >= 0 &&
        row < movie.seats.length &&
        col >= 0 &&
        col < movie.seats[row].length
      ) {
        if (movie.seats[row][col].status === 'booked') {
            return res.status(400).json({ message: `Seat ${movie.seats[row][col].id} is already booked.` });
        }
        movie.seats[row][col].status = 'booked';
      }
    }
    
    movie.markModified('seats');
    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMovie,
  getMoviesByStudio,
  getMovieById,
  bookSeats,
};
