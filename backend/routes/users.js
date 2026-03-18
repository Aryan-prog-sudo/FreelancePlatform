const db = require('../db');
const router = require('express').Router();

// GET: All users with their role
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

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password, role_id } = req.body;
  const [rows] = await db.query(
    `SELECT u.user_id, u.name, u.email, u.role_id, r.role_name
     FROM USER u
     JOIN ROLE r ON u.role_id = r.role_id
     WHERE u.email = ? AND u.password = ? AND u.role_id = ?`,
    [email, password, role_id]
  );
  if (rows.length === 0) {
    return res.status(401).json({ message: 'Invalid credentials or wrong role' });
  }
  res.json(rows[0]);
});

// SIGNUP - trigger auto_create_profile handles profile creation
router.post('/signup', async (req, res) => {
  const { user_id, name, email, password, phone, role_id } = req.body;
  try {
    await db.query(
      `INSERT INTO USER VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, email, password, phone, role_id]
    );
    res.json({ message: 'Account created!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email already exists or error occurred' });
  }
});

module.exports = router;