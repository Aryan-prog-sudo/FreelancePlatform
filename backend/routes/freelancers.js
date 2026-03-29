const db = require('../db');
const router = require('express').Router();

// Q11: Top freelancers by reputation
router.get('/top', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, fp.reputation_score, fp.bio
      FROM FREELANCER_PROFILE fp
      JOIN USER u ON fp.user_id = u.user_id
      ORDER BY fp.reputation_score DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching freelancers' });
  }
});

// Q12: Average escrow amount per category
router.get('/avg-escrow-by-category', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cat.category_name, AVG(e.amount) AS avg_escrow
      FROM CATEGORY cat
      JOIN PROJECT p ON cat.category_id = p.category_id
      JOIN CONTRACT c ON p.project_id = c.project_id
      JOIN ESCROW_PAYMENT e ON c.contract_id = e.contract_id
      GROUP BY cat.category_name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching escrow averages' });
  }
});

// Q13: Freelancers with reviews
router.get('/reviewed', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, r.rating, r.comment
      FROM REVIEW r
      JOIN CONTRACT c ON r.contract_id = c.contract_id
      JOIN FREELANCER_PROFILE fp ON c.freelancer_id = fp.freelancer_id
      JOIN USER u ON fp.user_id = u.user_id
      ORDER BY r.rating DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Q14: Freelancers with funded escrow
router.get('/funded', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, e.amount, e.status
      FROM ESCROW_PAYMENT e
      JOIN CONTRACT c ON e.contract_id = c.contract_id
      JOIN FREELANCER_PROFILE fp ON c.freelancer_id = fp.freelancer_id
      JOIN USER u ON fp.user_id = u.user_id
      WHERE e.status = 'Funded'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching funded escrows' });
  }
});

// Q15: Freelancer bid stats
router.get('/bid-stats', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, COUNT(b.bid_id) AS total_bids, AVG(b.amount) AS avg_bid
      FROM FREELANCER_PROFILE fp
      JOIN USER u ON fp.user_id = u.user_id
      LEFT JOIN BID b ON fp.freelancer_id = b.freelancer_id
      GROUP BY fp.freelancer_id, u.name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching bid stats' });
  }
});

// GET: All freelancers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.name, u.email, fp.bio, fp.reputation_score
      FROM FREELANCER_PROFILE fp
      JOIN USER u ON fp.user_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching freelancers' });
  }
});

module.exports = router;