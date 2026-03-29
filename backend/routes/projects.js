const db = require('../db');
const router = require('express').Router();

// Q1: All projects with client name and category
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.project_id, p.title, p.budget, p.deadline,
             u.name AS client, c.category_name
      FROM PROJECT p
      JOIN CUSTOMER_PROFILE cp ON p.customer_id = cp.customer_id
      JOIN USER u ON cp.user_id = u.user_id
      JOIN CATEGORY c ON p.category_id = c.category_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Q2: Projects with no contract yet
router.get('/no-contract', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.project_id, p.title, p.budget
      FROM PROJECT p
      LEFT JOIN CONTRACT c ON p.project_id = c.project_id
      WHERE c.contract_id IS NULL
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Q3: Projects with deadline in 2026
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT title, budget, deadline
      FROM PROJECT
      WHERE YEAR(deadline) = 2026
      ORDER BY deadline ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// POST: Add a new project
router.post('/', async (req, res) => {
  const { title, description, budget, deadline, customer_id, category_id } = req.body;
  try {
    await db.query(
      `INSERT INTO PROJECT (title, description, budget, deadline, customer_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, budget, deadline, customer_id, category_id || 1]
    );
    res.json({ message: 'Project posted!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.sqlMessage || 'Error creating project' });
  }
});

module.exports = router;