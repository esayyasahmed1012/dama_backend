const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Game = require('../models/Game');

router.post('/game_space', auth, async (req, res) => {
  try {
    let game = await Game.findOne({
      status: 'waiting',
      player1: { $ne: req.user.id },
    });

    if (game) {
      game.player2 = req.user.id;
      game.status = 'active';
      await game.save();
      game = await Game.findById(game._id).populate('player1 player2');
      return res.json({ game, role: 'player2' });
    }

    game = new Game({
      player1: req.user.id,
      status: 'waiting',
    });
    await game.save();
    game = await Game.findById(game._id).populate('player1 player2');
    res.json({ game, role: 'player1' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('player1 player2');
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }
    res.json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;