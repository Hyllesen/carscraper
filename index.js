const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://sfbay.craigslist.org/d/cars-trucks/search/cta";

async function main() {
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
  console.log(cars);
}

main();
