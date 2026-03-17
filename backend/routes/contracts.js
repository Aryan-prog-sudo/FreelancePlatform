const db = require('../db');
const router = require('express').Router();

// Q7: Full contract dashboard
router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.project_id, p.title AS project_title,
           u_cust.name AS client_name,
           u_free.name AS freelancer_assigned,
           c.status AS contract_status,
           e.amount AS escrow_amount,
           e.status AS payment_status
    FROM PROJECT p
    LEFT JOIN CUSTOMER_PROFILE cp ON p.customer_id = cp.customer_id
    LEFT JOIN USER u_cust ON cp.user_id = u_cust.user_id
    LEFT JOIN CONTRACT c ON p.project_id = c.project_id
    LEFT JOIN FREELANCER_PROFILE fp ON c.freelancer_id = fp.freelancer_id
    LEFT JOIN USER u_free ON fp.user_id = u_free.user_id
    LEFT JOIN ESCROW_PAYMENT e ON c.contract_id = e.contract_id
  `);
  res.json(rows);
});

// Q8: Contracts with disputes
router.get('/disputed', async (req, res) => {
  const [rows] = await db.query(`
    SELECT c.contract_id, c.status, d.description, d.status AS dispute_status
    FROM CONTRACT c
    JOIN DISPUTE d ON c.contract_id = d.contract_id
  `);
  res.json(rows);
});

// Q9: Total transaction amount per contract
router.get('/transactions-summary', async (req, res) => {
  const [rows] = await db.query(`
    SELECT c.contract_id, SUM(t.amount) AS total_transacted
    FROM CONTRACT c
    JOIN ESCROW_PAYMENT e ON c.contract_id = e.contract_id
    JOIN TRANSACTION t ON e.escrow_id = t.escrow_id
    GROUP BY c.contract_id
  `);
  res.json(rows);
});

module.exports = router;