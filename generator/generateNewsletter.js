const fetch = require("node-fetch");
const fs = require('fs')
const path = require('path')

// Settings

const from = new Date("2021-07-01").getTime();
const to = new Date("2021-07-31").getTime();

const month = "July"
const year = "2021"

const reviewsJson = 'https://api.audioxide.com/reviews.json';
const articlesJson = 'https://api.audioxide.com/articles.json';
const interviewsJson = 'https://api.audioxide.com/interviews.json';
const listeningPartiesJson = 'https://api.audioxide.com/listening-parties.json';
const funnyfarmJson = 'https://api.audioxide.com/funnyfarm.json';

buildNewsletter().then(res => writeToFile(res));

async function buildNewsletter() {

  var newsletterHtml = 
    `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
      <!--[if gte mso 9]><xml>
       <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
       </o:OfficeDocumentSettings>
      </xml><![endif]-->
      <!-- fix outlook zooming on 120 DPI windows devices -->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
      <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS 7-9 -->
      <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS 7-9 -->
      <title>Audioxide Archive</title>
      <link rel="icon" type="image/x-icon" href="audioxide.com/favicon.ico">
      <link rel="stylesheet" type="text/css" href="styles.css">
      <link rel="stylesheet" type="text/css" href="responsive.css">
    </head>
    
    <body style="margin:0; padding:0;" bgcolor="#F0F0F0" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
    
      <!-- 100% background wrapper (grey background) -->
      <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#fff">
        <tr>
          <td align="center" valign="top" bgcolor="#F0F0F0" style="background-color: #fff;">
    
            <br>
    
            <!-- 600px container (white background) -->
            <table border="0" width="600" cellpadding="0" cellspacing="0" class="container">
              <tr>
                <td class="container-padding header" align="left">
                  Audioxide
                </td>
              </tr>
              <tr>
                <td class="container-padding content" align="left">
                  <br>
                  <div class="title">${month} 0${year}</div>
                  <div class="title-blurb">Cheddar cheese and Brighton rocks</div>
                  <br>
    
                  <div class="body-text">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut placerat felis sed euismod blandit. Donec ac iaculis velit.</p>
                    <p> Maecenas cursus leo vel dui ullamcorper tincidunt. Pellentesque at massa sed ex lobortis volutpat. Aenean lorem arcu, ornare sed urna nec, aliquam euismod eros. Donec nisi arcu, fermentum at accumsan at, condimentum eu lorem. Non mollis dui cursus et. In et efficitur leo.</p>
                    <p>Mauris eu sapien ac urna fermentum lacinia. Nam eu egestas massa, nec aliquam lorem. Vestibulum molestie metus ant.</p>
                    <p>Be well,</p>
                    <p>André, Fred, and Andrew </p>
                  </div>
    
                  <hr />`
  ;

  // Check for and add reviews in time range

  await fetch(reviewsJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat(`
    <!-- ALBUM REVIEWS -->
        
    <section>

      <h2>Album Reviews</h2>`
      )
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        var imageSource = data[i].metadata.featuredimage["medium-square"]
        var primaryColor = data[i].metadata.colours[0]
        newsletterHtml = newsletterHtml.concat(
          `<table width="204" border="0" cellpadding="0" cellspacing="0" align="left" class="force-row">
            <tr>
              <td class="col" valign="top">
                <img class="album-artwork"
                  src=${imageSource}
                  style="border: 3px solid ${primaryColor};">
              </td>
            </tr>
          </table>

          <table width="284" border="0" cellpadding="0" cellspacing="0" align="right" class="force-row">
            <tr>
              <td class="col" valign="top">
                <h3 class="review-album" style="color: ${primaryColor};">${data[i].metadata.album}</h3>
                <h3 class="review-artist">${data[i].metadata.artist}</h3>
                <p class="review-summary">‘${data[i].metadata.summary}’</p>
                <span class="review-link"><a href="https://audioxide.com/reviews/${data[i].metadata.slug}/">Full
                    review</a> →</span>
              </td>
            </tr>
          </table>
          
          <hr class="invisible-divider">
                <br />
                <br />`
          )          
      }
    }
    newsletterHtml = newsletterHtml.concat(`
    <hr class="invisible-divider">

    <hr />`)
  });
  
  // Check for and add articles in time range

  await fetch(articlesJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat(`
    <section>
      <h2>Articles</h2>`);
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        newsletterHtml = newsletterHtml.concat(`
        <div class="article-card">
        <img class="article-image" src="${data[i].metadata.featuredimage["medium-original"]}">
        <h3 class="article-title">${data[i].metadata.title}</h3>
        <p class="body-text">${data[i].metadata.summary}</p>
        <span class="article-link"><a href="https://audioxide.com/articles/${data[i].metadata.slug}/">Full
          article</a> →</span>
      </div>

      <hr class="invisible-divider">
      <br />
      <br />
        `
        );
      }
    }
    newsletterHtml = newsletterHtml.concat("\n")
  });


  // Check for and add interviews in time range

  // Check for and add listening parties in time range

  // Check for and add Funnyfarm entries in time range

  // Add album artwork stories, site development, footer, and CSS

  newsletterHtml = newsletterHtml.concat(
    `<section>

    <h2>Artwork Stories</h2>

      <p class="body-text">We added 24 album artwork credits to the database this month. Not all masterpieces, but not half bad, etc.</p>

      <div class="artwork-story-box">
        <div class="one">
          <a href="#">
          <img class="artwork-story-image"
              src="https://audioxide.com/api/images/album-artwork/straight-outta-compton-nwa-medium-square.jpg"
              style="border: 3px solid black;">
          </a>
        </div>
        <div class="two">
          <a href="#">
          <img class="artwork-story-image"
              src="https://audioxide.com/api/images/album-artwork/on-the-beach-neil-young-medium-square.jpg"
              style="border: 3px solid lightblue;">
            </a>
        </div>
        <div class="three">
          <a href="#">
          <img class="artwork-story-image"
              src="https://audioxide.com/api/images/album-artwork/in-utero-nirvana-medium-square.jpg"
              style="border: 3px solid darkred;">
            </a>
        </div>
        <div class="four">
          <a href="#">
          <img class="artwork-story-image"
              src="https://audioxide.com/api/images/album-artwork/the-specials-the-specials-medium-square.jpg"
              style="border: 3px solid black;">
            </a>
        </div>
      </div>

      <p class="body-text">In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi. Nam semper ultricies erat, et hendrerit ligula sagittis non. Integer ac enim eu leo aliquam luctus.</p>

    <hr class="invisible-divider">

  </section>

  <hr />

  <!-- SITE DEVELOPMENT -->

  <section>

    <h2>Site Development</h2>

    <p class="body-text">In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi. Nam semper ultricies erat, et hendrerit ligula sagittis non. Integer ac enim eu leo aliquam luctus.</p>

    <img src="https://audioxide-wiki.neocities.org/Images/abbey-road-album-credit.png">

    <p class="body-text">In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi. Nam semper ultricies erat, et hendrerit ligula sagittis non. Integer ac enim eu leo aliquam luctus.</p>

    <p class="body-text">In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi.</p>

  </section>

  <!--[if mso]></td></tr></table><![endif]-->


  <!--/ end example -->

<tr>
<td class="container-padding footer-text" align="left">
  <br><br>
  &copy; Audioxide. All rights reserved.
  <br><br>

  You are receiving this newsletter because you opted in on our website, or perhaps someone with your 
  email address wanted you to suffer. Update your <a href="#">email
    preferences</a> or <a href="#">unsubscribe</a>.
  <br><br>

  <a href="https://www.audioxide.com">www.audioxide.com</a><br>

  <br><br>

</td>
</tr>
</table>
<!--/600px container -->


</td>
</tr>
</table>
<!--/100% background wrapper-->

</body>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200;1,300;1,400;1,500;1,600&display=swap');
@import url(//db.onlinewebfonts.com/c/4387b781fdcc752283b72bdc76757065?family=All+Round+Gothic);

h1, h2, h3, h4, h5, h6,
.header,
.title,
.subtitle,
.footer-text,
.title-blurb,
.review-link,
.test {
  font-family: 'Source Sans Pro', sans-serif;
}

a, a:visited {
    color: #f01d4f;
}

h2 {
    text-align: center;
    font-size: 24px;
    font-weight: 500;
}

h3 {
    margin: 10px 0px;
}

img {
  width: 100%;
}

.header {
  font-size: 24px;
  padding-bottom: 12px;
  color: #000;
  text-align: center;
  text-transform: lowercase;
  font-family: "All Round Gothic";
}

.footer-text {
  font-size: 12px;
  line-height: 16px;
  color: #aaaaaa;
}
.footer-text a {
  color: #aaaaaa;
}

.container {
  width: 600px;
  max-width: 600px;
}

.container-padding {
  padding-left: 44px;
  padding-right: 44px;
}

.content {
  padding-top: 12px;
  padding-bottom: 12px;
  border-radius: 10px;
  background-color: #ffffff;
  /* box-shadow: 0px 0px 12px 5px #1f1f1f; */
}

code {
  background-color: #eee;
  padding: 0 4px;
  font-family: Menlo, Courier, monospace;
  font-size: 12px;
}

.title {
  font-size: 14px;
  font-weight: 400;
  color: #374550;
  margin-bottom: 10px;
  text-align: center;
}

.title-blurb {
  font-size: 24px;
  font-weight: 700;
  color: #374550;
  text-align: center;
}

.opening-blurb {
    font-size: 16px;
}

.subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #2469A0;
}

.subtitle span {
  font-weight: 400;
  color: #999999;
}

.body-text {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 15px;
  line-height: 22px;
  text-align: left;
  color: #333333;
}

.col {
  font-family: 'Spectral', serif;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  color: #333333;
  width: 100%;
}

a[href^="x-apple-data-detectors:"],
a[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: none !important;
  font-size: inherit !important;
  font-family: inherit !important;
  font-weight: inherit !important;
  line-height: inherit !important;
}

/* LAYOUT */

hr {
  background: #f5f5f5;
  border: 0;
  height: 2px;
  width: 95%;
  margin: 20px 0px;
}

.invisible-divider {
    clear: both;
    background: none;
    margin: 0px;
}

.spacer {
  padding: 50px;
}

/* ALBUM REVIEWS */

.album-artwork {
  width: 100%;
  border-radius: 5px;
}

.review-album {
    font-size: 20px;
    font-style: italic;
}

.review-artist {
    font-size: 18px;
    font-weight: 500;
}

.review-summary {
    font-style: italic;
    font-size: 15px;
    line-height: 22px;
}

.review-link {
    font-weight: 500;
    font-size: 15px;
}

/* ARTICLES */

.article-card {

}

.article-image {
  width: 100%;
  border-radius: 10px;
}

.article-title {
  font-weight: 500;
}

.article-link {
  font-weight: 500;
  font-size: 15px;
  font-family: 'Source Sans Pro', sans-serif;
}

/* ARTWORK STORIES */

.artwork-story-box {
  display: flex;
  width: 98%;
}

.one {
  flex: 1 1 auto;
  padding-right: 5px;
}

.two {
  flex: 1 1 auto;
  padding: 0px 5px;
}

.three {
  flex: 1 1 auto;
  padding: 0px 5px;
}

.four {
  flex: 1 1 auto;
  padding-left: 5px;
}

.artwork-story-image {
  width: 100%;
  border-radius: 5px;
}

.artwork-story-image:hover {
  opacity: 0.8;
}

/* RESPONSIVE.CSS */

body {
    margin: 0;
    padding: 0;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  }
  
  table {
    border-spacing: 0;
  }
  
  table td {
    border-collapse: collapse;
  }
  
  .ExternalClass {
    width: 100%;
  }
  
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
    line-height: 100%;
  }
  
  .ReadMsgBody {
    width: 100%;
    background-color: #ebebeb;
  }
  
  table {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  
  img {
    -ms-interpolation-mode: bicubic;
  }
  
  .yshortcuts a {
    border-bottom: none !important;
  }
  
  @media screen and (max-width: 599px) {
    .force-row,
    .container {
      width: 100% !important;
      max-width: 100% !important;
    }
  }
  @media screen and (max-width: 400px) {
    .container-padding {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
  }
  .ios-footer a {
    color: #aaaaaa !important;
    text-decoration: underline;
  }

</style>

</html>`

  )

  return newsletterHtml;

};

function writeToFile(html) {
    const filePath = path.join(__dirname, '/test.html');
    fs.writeFileSync(filePath, html);
};
