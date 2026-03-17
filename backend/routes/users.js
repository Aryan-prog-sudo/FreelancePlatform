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

// SIGNUP
router.post('/signup', async (req, res) => {
  const { user_id, name, email, password, phone, role_id } = req.body;
  try {
    await db.query(
      `INSERT INTO USER VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, email, password, phone, role_id]
    );
    if (role_id == 1) {
      await db.query(`INSERT INTO CUSTOMER_PROFILE VALUES (?, ?)`, [user_id, user_id]);
    } else if (role_id == 2) {
      await db.query(`INSERT INTO FREELANCER_PROFILE VALUES (?, ?, '', 0.00)`, [user_id, user_id]);
    } else if (role_id == 3) {
      await db.query(`INSERT INTO ARTIST_PROFILE VALUES (?, ?, '', 0.00)`, [user_id, user_id]);
    }
    res.json({ message: 'Account created!' });
  } catch (err) {
    res.status(500).json({ message: 'Email already exists or error occurred' });
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
  const { user_id, name, email, password, phone, role_id } = req.body;
  try {
    await db.query(
      `INSERT INTO USER VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, email, password, phone, role_id]
    );
    if (role_id == 1) {
      const [existing] = await db.query(`SELECT MAX(customer_id) as max_id FROM CUSTOMER_PROFILE`);
      const new_id = (existing[0].max_id || 0) + 1;
      await db.query(`INSERT INTO CUSTOMER_PROFILE VALUES (?, ?)`, [new_id, user_id]);
    } else if (role_id == 2) {
      const [existing] = await db.query(`SELECT MAX(freelancer_id) as max_id FROM FREELANCER_PROFILE`);
      const new_id = (existing[0].max_id || 0) + 1;
      await db.query(`INSERT INTO FREELANCER_PROFILE VALUES (?, ?, '', 0.00)`, [new_id, user_id]);
    } else if (role_id == 3) {
      const [existing] = await db.query(`SELECT MAX(artist_id) as max_id FROM ARTIST_PROFILE`);
      const new_id = (existing[0].max_id || 0) + 1;
      await db.query(`INSERT INTO ARTIST_PROFILE VALUES (?, ?, '', 0.00)`, [new_id, user_id]);
    }
    res.json({ message: 'Account created!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email already exists or error occurred' });
  }
});

module.exports = router;