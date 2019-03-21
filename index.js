const request = require("request-promise");
const cheerio = require("cheerio");
const express = require("express");
const CraigslistCar = require("./model/CraiglistCar");
const mongoDbUrl = require("./config/mongodb");
const mongoose = require("mongoose");
const app = express();

const url = "https://sfbay.craigslist.org/d/cars-trucks/search/cta";

async function scrapeCars() {
  const result = await request.get(url);
  const $ = await cheerio.load(result);
  const cars = $(".result-info")
    .map((i, element) => {
      const titleElement = $(element).find(".result-title");
      const title = titleElement.text();
      const url = titleElement.attr("href");
      const timestamp = new Date(
        $(element)
          .find(".result-date")
          .attr("datetime")
      );
      return { title, timestamp, url };
    })
    .get();
  return cars;
}

async function insertCraigslistCarInMongoDb(carArray) {
  const promises = carArray.map(async car => {
    const carFromDb = await CraigslistCar.findOne({ url: car.url });
    if (!carFromDb) {
      const newCar = new CraigslistCar(car);
      return newCar.save();
    }
  });
  await Promise.all(promises);
}

async function main() {
  try {
    await mongoose.connect(mongoDbUrl, { useNewUrlParser: true });
    console.log("Connected to mongodb");
    const carArray = await scrapeCars();
    await insertCraigslistCarInMongoDb(carArray);
    mongoose.disconnect();
    console.log("disconnected from mongodb!");
  } catch (err) {
    console.error(err);
  }
}

app.get("/", async (req, res, next) => {
  try {
    await main();
    return res.status(200).json("Cars scraped!");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});
