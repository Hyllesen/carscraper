const mongoose = require("mongoose");

const craigslistCarSchema = new mongoose.Schema({
  url: String,
  timestamp: Date,
  title: String
});

const CraigslistCar = mongoose.model("CraigslistCar", craigslistCarSchema);

module.exports = CraigslistCar;
