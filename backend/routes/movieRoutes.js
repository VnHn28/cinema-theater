const express = require('express');
const router = express.Router();
const {
  createMovie,
  getMoviesByStudio,
  getMovieById,
  bookSeats,
} = require('../controllers/movieController');

router.post('/', createMovie);
router.get('/studio/:studio', getMoviesByStudio);
router.get('/:id', getMovieById);
router.patch('/:id/seats', bookSeats);

module.exports = router;
