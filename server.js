const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const Wish = require('./models/Wish');

dotenv.config();
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'wishbin_secret_key', // change to a long random string
    resave: false,
    saveUninitialized: false
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error(err));

// Home page - Choose mode
app.get('/', (req, res) => {
    res.render('index', { page: 'home', wishes: [], error: null });
});

// User form
app.get('/user', (req, res) => {
    res.render('index', { page: 'user', wishes: [], error: null });
});

app.post('/user', async (req, res) => {
    const { name, wish } = req.body;
    await Wish.create({ name, wish });
    res.send('<h2>🎉 Your wish has been submitted! <a href="/">Go back</a></h2>');
});

// Admin login
app.get('/admin', (req, res) => {
    res.render('index', { page: 'adminLogin', wishes: [], error: null });
});

app.post('/admin', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.redirect('/admin/dashboard');
    }
    res.render('index', { page: 'adminLogin', wishes: [], error: '❌ Incorrect password' });
});

// Protect admin dashboard
function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin');
}

// Admin dashboard
app.get('/admin/dashboard', isAdmin, async (req, res) => {
    const wishes = await Wish.find().sort({ createdAt: -1 });
    res.render('index', { page: 'adminDashboard', wishes, error: null });
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
