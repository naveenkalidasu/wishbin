const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  name: String,
  regno: String,
  wish: String
}, { timestamps: true });

module.exports = mongoose.model('Wish', wishSchema);
