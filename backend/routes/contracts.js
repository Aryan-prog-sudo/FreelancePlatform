const db = require('../db');
const router = require('express').Router();

// Q7: Full contract dashboard
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.project_id, p.title AS project_title,
             u_cust.name AS client_name,
             u_free.name AS freelancer_assigned,
             c.status AS contract_status,
             e.amount AS escrow_amount,
             e.status AS payment_status,
             e.escrow_id
      FROM PROJECT p
      LEFT JOIN CUSTOMER_PROFILE cp ON p.customer_id = cp.customer_id
      LEFT JOIN USER u_cust ON cp.user_id = u_cust.user_id
      LEFT JOIN CONTRACT c ON p.project_id = c.project_id
      LEFT JOIN FREELANCER_PROFILE fp ON c.freelancer_id = fp.freelancer_id
      LEFT JOIN USER u_free ON fp.user_id = u_free.user_id
      LEFT JOIN ESCROW_PAYMENT e ON c.contract_id = e.contract_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching contracts' });
  }
});

// Q8: Contracts with disputes
router.get('/disputed', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.contract_id, c.status, d.description, d.status AS dispute_status
      FROM CONTRACT c
      JOIN DISPUTE d ON c.contract_id = d.contract_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching disputes' });
  }
});

// Q9: Total transaction amount per contract
router.get('/transactions-summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.contract_id, SUM(t.amount) AS total_transacted
      FROM CONTRACT c
      JOIN ESCROW_PAYMENT e ON c.contract_id = e.contract_id
      JOIN TRANSACTION t ON e.escrow_id = t.escrow_id
      GROUP BY c.contract_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching transaction summary' });
  }
});

// GET: All bids for a specific project
router.get('/bids/:project_id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.bid_id, b.amount, b.proposal,
             u.name AS freelancer_name,
             fp.freelancer_id, fp.reputation_score
      FROM BID b
      JOIN FREELANCER_PROFILE fp ON b.freelancer_id = fp.freelancer_id
      JOIN USER u ON fp.user_id = u.user_id
      WHERE b.project_id = ?
    `, [req.params.project_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching bids' });
  }
});

// POST: Accept a bid → creates contract → trigger fires escrow
router.post('/accept-bid', async (req, res) => {
  const { project_id, freelancer_id } = req.body;
  try {
    await db.query(
      `INSERT INTO CONTRACT (project_id, freelancer_id, status) VALUES (?, ?, 'Signed')`,
      [project_id, freelancer_id]
    );
    res.json({ message: 'Bid accepted! Contract created and escrow funded automatically.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error accepting bid' });
  }
});

// GET: Escrow status for all contracts
router.get('/escrow', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.escrow_id, e.amount, e.status AS escrow_status,
             c.contract_id, c.status AS contract_status,
             p.title AS project_title,
             u.name AS freelancer_name
      FROM ESCROW_PAYMENT e
      JOIN CONTRACT c ON e.contract_id = c.contract_id
      JOIN PROJECT p ON c.project_id = p.project_id
      JOIN FREELANCER_PROFILE fp ON c.freelancer_id = fp.freelancer_id
      JOIN USER u ON fp.user_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching escrow' });
  }
});

// POST: Release or Refund escrow
router.post('/escrow/update', async (req, res) => {
  const { escrow_id, status } = req.body;
  try {
    await db.query(
      `UPDATE ESCROW_PAYMENT SET status = ? WHERE escrow_id = ?`,
      [status, escrow_id]
    );
    res.json({ message: `Escrow ${status} successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating escrow' });
  }
});

module.exports = router;