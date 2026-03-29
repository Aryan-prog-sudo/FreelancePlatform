const db = require('../db');
const router = require('express').Router();

// GET: All artists
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, u.email, ap.bio, ap.reputation_score
      FROM ARTIST_PROFILE ap
      JOIN USER u ON ap.user_id = u.user_id
      ORDER BY ap.reputation_score DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching artists' });
  }
});

// GET: Artists with portfolios
router.get('/portfolios', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, p.description AS portfolio_description
      FROM ARTIST_PROFILE ap
      JOIN USER u ON ap.user_id = u.user_id
      JOIN PORTFOLIO p ON ap.artist_id = p.artist_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching portfolios' });
  }
});

module.exports = router;