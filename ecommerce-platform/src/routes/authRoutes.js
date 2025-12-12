const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { SECRET_KEY } = require('../middleware/authMiddleware');

// Register Page
router.get('/register', (req, res) => {
    res.render('register');
});

// Register Logic
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, role],
        function(err) {
            if (err) {
                console.error(err);
                return res.render('register', { error: 'Username already exists or invalid data' });
            }
            res.redirect('/login');
        }
    );
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// Login Logic
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        if (user.role === 'seller') {
            res.redirect('/seller/dashboard');
        } else {
            res.redirect('/buyer/home');
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router;
