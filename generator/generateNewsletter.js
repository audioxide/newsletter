const fetch = require("node-fetch");

// Set date range

const from = new Date("2021-03-31").getTime();
const to = new Date("2021-05-01").getTime();

// Check for albums in time range

fetch('https://api.audioxide.com/reviews.json')
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    console.log("Albums reviewed in time range");
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        console.log("‘" + data[i].metadata.album + "’ by " + data[i].metadata.artist);
      }
    }
    console.log("\n");
  });

// Check for articles in time range

fetch('https://api.audioxide.com/articles.json')
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    console.log("Articles published in time range");
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        console.log("‘" + data[i].metadata.title + "’ by " + data[i].metadata.author.name);
      }
    }
    console.log("\n");
  });

// Check for interviews in time range

// Check for listening parties in time range

// Check for Funnyfarm entries in time range
