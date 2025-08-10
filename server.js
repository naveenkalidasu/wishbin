const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Wish = require('./models/wishModel');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.get('/', async (req, res) => {
  const wishes = await Wish.find().sort({ createdAt: -1 });
  res.render('index', { wishes });
});

app.post('/wish', async (req, res) => {
  const { name, regno, wish } = req.body;
  if (!name || !regno || !wish) {
    return res.redirect('/');
  }
  const newWish = await Wish.create({ name, regno, wish });
  io.emit('newWish', newWish);
  res.redirect('/');
});

// Socket.io
io.on('connection', () => {
  console.log('🟢 A user connected');
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
