const fetch = require("node-fetch");
const fs = require('fs')
const path = require('path')

// Set date range

const from = new Date("2021-03-31").getTime();
const to = new Date("2021-05-01").getTime();

const reviewsJson = 'https://api.audioxide.com/reviews.json';
const articlesJson = 'https://api.audioxide.com/articles.json';
const interviewsJson = 'https://api.audioxide.com/interviews.json';
const listeningPartiesJson = 'https://api.audioxide.com/listening-parties.json';
const funnyfarmJson = 'https://api.audioxide.com/funnyfarm.json';

buildNewsletter().then(res => writeToFile(res));

async function buildNewsletter() {

  var newsletterHtml = "<!-- HEADER -->\n\n";

  // Check for and add reviews in time range

  await fetch(reviewsJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat("<!-- ALBUM REVIEWS -->\n\n")
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        newsletterHtml = newsletterHtml.concat("‘" + data[i].metadata.album + "’ by " + data[i].metadata.artist + "\n")
      }
    }
    newsletterHtml = newsletterHtml.concat("\n")
  });
  
  // Check for and add articles in time range

  await fetch(articlesJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat("<!-- ARTICLES -->\n\n");
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        newsletterHtml = newsletterHtml.concat("‘" + data[i].metadata.title + "’ by " + data[i].metadata.author.name + "\n");
      }
    }
    newsletterHtml = newsletterHtml.concat("\n")
  });

  // Check for and add interviews in time range

  // Check for and add listening parties in time range

  // Check for and add Funnyfarm entries in time range

  // Add album artwork stories template

  newsletterHtml = newsletterHtml.concat("<!-- ARTWORK STORIES -->\n\n")

  // Add site development template

  newsletterHtml = newsletterHtml.concat("<!-- SITE DEVELOPMENT -->\n")

  return newsletterHtml;

};

function writeToFile(html) {
    const filePath = path.join(__dirname, '/test.html');
    fs.writeFileSync(filePath, html);
};
