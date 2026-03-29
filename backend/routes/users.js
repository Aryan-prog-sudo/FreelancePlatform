const db = require('../db');
const router = require('express').Router();
const bcrypt = require('bcryptjs');

// GET: All users with their role
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.user_id, u.name, u.email, r.role_name
      FROM USER u
      JOIN ROLE r ON u.role_id = r.role_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password, role_id } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.name, u.email, u.password, u.role_id, r.role_name
       FROM USER u
       JOIN ROLE r ON u.role_id = r.role_id
       WHERE u.email = ? AND u.role_id = ?`,
      [email, role_id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials or wrong role' });
    }
    const user = rows[0];
    const isHashed = user.password.startsWith('$2');
    const passwordMatch = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials or wrong role' });
    }
    delete user.password;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, role_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO USER (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, role_id]
    );
    res.json({ message: 'Account created!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email already exists or error occurred' });
  }
});

// POST: Add user directly
router.post('/', async (req, res) => {
  const { name, email, password, phone, role_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO USER (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, role_id]
    );
    res.json({ message: 'User created!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  const { user_id, old_password, new_password } = req.body;
  try {
    // Get current password
    const [rows] = await db.query(
      `SELECT password FROM USER WHERE user_id = ?`, [user_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const current = rows[0].password;
    const isHashed = current.startsWith('$2');
    const match = isHashed
      ? await bcrypt.compare(old_password, current)
      : old_password === current;

    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query(`UPDATE USER SET password = ? WHERE user_id = ?`, [hashed, user_id]);
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;