const db = require('../db');
const router = require('express').Router();

// Q10: All users with their role
router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.user_id, u.name, u.email, r.role_name
    FROM USER u
    JOIN ROLE r ON u.role_id = r.role_id
  `);
  res.json(rows);
});

// POST: Register a new user
router.post('/', async (req, res) => {
  const { user_id, name, email, password, phone, role_id } = req.body;
  await db.query(
    `INSERT INTO USER VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, name, email, password, phone, role_id]
  );
  res.json({ message: 'User created!' });
});

module.exports = router;