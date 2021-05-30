const fetch = require("node-fetch");

// Receive desired month and year

const month = "May";
const year = 2021;

// Check for albums in time range

fetch('https://api.audioxide.com/reviews.json')
  .then(response => response.json())
  .then(data => {
    let tally = data.length;
    console.log("Audioxide has reviewed " + data.length + " albums. They are:");
    for (let i = 0; i < tally; i++) {
      console.log("‘" + data[i].metadata.album + "’ by " + data[i].metadata.artist);
    }
  });

// Check for articles in time range

// Check for interviews in time range

// Check for listening parties in time range

// Check for Funnyfarm entries in time range
