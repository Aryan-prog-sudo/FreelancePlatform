const db = require('../db');
const router = require('express').Router();

// Q4: All bids with freelancer name and project title
router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.bid_id, b.amount, b.proposal,
           p.title AS project, u.name AS freelancer
    FROM BID b
    JOIN PROJECT p ON b.project_id = p.project_id
    JOIN FREELANCER_PROFILE fp ON b.freelancer_id = fp.freelancer_id
    JOIN USER u ON fp.user_id = u.user_id
  `);
  res.json(rows);
});

// Q5: Bids where amount is below project budget
router.get('/under-budget', async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.bid_id, b.amount, p.budget, p.title,
           (p.budget - b.amount) AS savings
    FROM BID b
    JOIN PROJECT p ON b.project_id = p.project_id
    WHERE b.amount < p.budget
  `);
  res.json(rows);
});

// Q6: Count of bids per project
router.get('/count-per-project', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.title, COUNT(b.bid_id) AS total_bids
    FROM PROJECT p
    LEFT JOIN BID b ON p.project_id = b.project_id
    GROUP BY p.project_id, p.title
    ORDER BY total_bids DESC
  `);
  res.json(rows);
});

// POST: Submit a new bid
router.post('/', async (req, res) => {
  const { bid_id, amount, proposal, project_id, freelancer_id } = req.body;
  await db.query(
    `INSERT INTO BID VALUES (?, ?, ?, ?, ?)`,
    [bid_id, amount, proposal, project_id, freelancer_id]
  );
  res.json({ message: 'Bid submitted!' });
});

module.exports = router;