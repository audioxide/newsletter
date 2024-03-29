const fetch = require("node-fetch");
const fs = require('fs')
const path = require('path')

// Settings

const from = new Date("2021-05-01").getTime();
const to = new Date("2021-06-01").getTime();

const month = "May"
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
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
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
    <title>Audioxide Archive Template</title>
</head>
<body style="margin:0; padding:0;" bgcolor="#F0F0F0" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">

<!-- 100% background wrapper (grey background) -->
<table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#F0F0F0">
    <tr>
        <td align="center" valign="top" bgcolor="#F0F0F0" style="background-color: #ffffff;">

            <!-- 600px container (white background) -->

            <table border="0" width="600" cellpadding="0" cellspacing="0" class="container container-padding">

                <!-- INTRODUCTION -->

                <tr>
                    <td class="newsletter-section">
                        <table>
                            <tr>
                                <td style="background-image: url('https://live.staticflickr.com/1121/5119659545_04939a125b_b.jpg')"
                                    class="lead-image">
                                    <a class="lead-image-credit" href="https://flic.kr/p/8NpAqa">Photograph by Kmeron →</a>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <img src="https://raw.githubusercontent.com/audioxide/brand/main/assets/png/bordered-emblem-black-and-white.png"
                                         class="audioxide-emblem">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p class="month">January 02021</p>
                                    <h2 class="title">MM..DOOM</h2>
                                    <p>Snappy opening line(s).</p>
                                    <p>Aliquam non tortor at ipsum dictum rhoncus. Nulla facilisi.
                                        Sed ipsum lacus, porttitor ac sapien ut, sollicitudin ultricies massa. Nulla facilisi.
                                    </p>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce faucibus, est eu tristique
                                        molestie, velit sem finibus nibh, interdum tempor felis enim in ante. Maecenas nisi
                                        libero, faucibus sit amet augue et, elementum venenatis tellus.</p>
                                    <p>Ut ornare velit nec urna gravida dignissim. Integer at ultricies risus. Donec semper
                                        luctus augue a pellentesque. Aliquam non tortor at ipsum dictum rhoncus. Nulla facilisi.
                                        Sed ipsum lacus, porttitor ac sapien ut, sollicitudin ultricies massa. Nulla facilisi.
                                    </p>
                                    <p>Signing off,</p>
                                    <p>André, Fred, and Andrew</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`
  ;

  // Check for and add reviews in time range

  await fetch(reviewsJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat(`
    <!-- REVIEWS -->

                <tr>
                    <td class="newsletter-section">
                        <table>
                            <tr>
                                <td>
                                    <h3 class="section-heading">
                                        <span class="section-heading-wrapper">
                                            Reviews
                                        </span>
                                    </h3>
                                </td>
                            </tr>`
      )
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        var imageSource = data[i].metadata.featuredimage["medium-square"]
        var primaryColor = data[i].metadata.colours[0]
        newsletterHtml = newsletterHtml.concat(
          `<tr>
                                <td>
                                    <!--[if mso]>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr><td width="50%" valign="top"><![endif]-->

                                    <table width="215" border="0" cellpadding="0" cellspacing="0" align="left" class="force-row">
                                        <tr>
                                            <td class="col" valign="top">
                                                <img src="${imageSource}"
                                                alt="Album artwork of '${data[i].metadata.album}' by ${data[i].metadata.artist}"
                                                class="review-image"
                                                style="border: 3px solid ${primaryColor};">
                                            </td>
                                        </tr>
                                    </table>

                                    <!--[if mso]></td><td width="50%" valign="top"><![endif]-->

                                    <table width="355" border="0" cellpadding="0" cellspacing="0" align="right" class="force-row">
                                        <tr>
                                            <td class="col review-info" valign="top">
                                                <h4 class="review-album-name" style="color: ${primaryColor};">${data[i].metadata.album}</h4>
                                                <h4 class="review-artist-name">${data[i].metadata.artist}</h4>
                                                <p class="review-summary">‘${data[i].metadata.summary}’</p>
                                                <span><a href="https://audioxide.com/reviews/${data[i].metadata.slug}/">Read review</a> →</span>
                                            </td>
                                        </tr>
                                    </table>

                                    <!--[if mso]></td></tr></table><![endif]-->

                                    <div class="review-divider"></div>
                                    <hr class="hr">
                                </td>
                            </tr>    
                `
          )          
      }
    }
    newsletterHtml = newsletterHtml.concat(`
    </table>
                    </td>
                </tr>`)
  });
  
  // Check for and add articles in time range

  await fetch(articlesJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat(`
    <!-- ARTICLES -->

                <tr>
                    <td class="newsletter-section">
                        <table>
                            <tr>
                                <td>
                                    <h3 class="section-heading">
                                        <span class="section-heading-wrapper">
                                            Articles
                                        </span>
                                    </h3>
                                </td>
                            </tr>`);
    for (let i = tally; i > 0; i--) {
      var publishDate = new Date(data[i].metadata.created).getTime();
      if (publishDate >= from && publishDate <= to) {
        newsletterHtml = newsletterHtml.concat(`

      <tr>
                                <td>
                                    <img src="${data[i].metadata.featuredimage["medium-original"]}"
                                         class="article-image">
                                    <h4>${data[i].metadata.title}</h4>
                                    <p>${data[i].metadata.summary}</p>
                                    <p><a href="https://audioxide.com/articles/${data[i].metadata.slug}/">Read article</a> →</p>
                                    <hr class="hr">
                                </td>
                            </tr>
        `
        );
      }
    }
    newsletterHtml = newsletterHtml.concat(`
    </table>
                    </td>
                </tr>
    `)
  });


  // Check for and add interviews in time range

  // Check for and add listening parties in time range

  // Check for and add Funnyfarm entries in time range

  // Add album artwork stories, site development, footer, and CSS

  newsletterHtml = newsletterHtml.concat(
    `<!-- ARTWORK STORIES -->

                <tr>
                    <td class="newsletter-section">
                        <table>
                            <tr>
                                <td>
                                    <h3 class="section-heading">
                                        <span class="section-heading-wrapper">
                                            Artwork stories
                                        </span>
                                    </h3>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Paragraph.</p>
                                    <table class="artwork-story-grid-container">
                                        <tr>
                                            <td>
                                                <a href="#">
                                                <img src="https://audioxide-wiki.neocities.org/Images/square-placeholder-image.png"
                                                     class="artwork-story-image"
                                                     alt="Album artwork alt text"
                                                     style="border: 3px solid gray;">
                                                </a>
                                            </td>
                                            <td>
                                                <a href="#">
                                                <img src="https://audioxide-wiki.neocities.org/Images/square-placeholder-image.png"
                                                     class="artwork-story-image"
                                                     alt="Album artwork alt text"
                                                     style="border: 3px solid gray;
                                                            margin: auto;
                                                            display: block;">
                                                </a>
                                            </td>
                                            <td>
                                                <a href="#">
                                                <img src="https://audioxide-wiki.neocities.org/Images/square-placeholder-image.png"
                                                     class="artwork-story-image"
                                                     alt="Album artwork alt text"
                                                     style="border: 3px solid gray;
                                                            float: right;">
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p>Another paragraph.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- SITE DEVELOPMENT -->

                <tr>
                    <td class="newsletter-section">
                        <table>
                            <tr>
                                <td>
                                    <h3 class="section-heading">
                                        <span class="section-heading-wrapper">
                                            Site development
                                        </span>
                                    </h3>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>A paragraph.</p>
                                    <p>Another paragraph.</p>
                                    <img class="site-dev-image" src="https://audioxide-wiki.neocities.org/Images/landscape-placeholder-image.png">
                                    <p>And one more paragraph.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                    </td>
                </tr>
                <tr>
                    <td class="footer-text" align="left">
                        <p>Sample Footer text: &copy; 2015 Acme, Inc.</p>
                        <p>You are receiving this email because you opted in on our website. Update your <a href="#">email preferences</a> or <a href="#">unsubscribe</a>.</p>

                        <p>Audioxide.</p>
                        <span class="ios-footer">
              123 Main St.<br>
              Springfield, MA 12345<br>
            </span>
                        <a href="https://audioxide.com">audioxide.com</a><br>

                        <br><br>

                    </td>
                </tr>
            </table><!--/600px container -->


        </td>
    </tr>
</table><!--/100% background wrapper-->

</body>

<style>
/* FOUNDATIONS */

@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200;1,300;1,400;1,500;1,600&display=swap');
@import url('http://fonts.cdnfonts.com/css/rounded-elegance');

* {
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 18px;
    margin: 0;
    padding: 0;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
}

p, h1, h2, h3, h4, h5, h6 {
    margin-bottom: 15px;
    line-height: 150%;
}

h4 {
    font-size: 22px;
}

img {
    width: 100%;
}
a {
    color: #f01d4f;
}

a:hover {
    color: pink;
}

.container {
    width: 600px;
    max-width: 600px;
    margin: 0;
    padding: 0;
}

/* LAYOUT */

.section-heading, .title, .month {
    text-align: center;
}

.section-heading {
    color: #f5f5f5;
    margin-bottom: 60px;
    font-family: 'Rounded Elegance', sans-serif;
    font-weight: 600;
    letter-spacing: 5px;
    text-transform: lowercase;
}

.section-heading-wrapper {
    background-color: #282828;
    filter: drop-shadow(0 0 0.3rem rgb(180, 180, 180));
    padding: 20px 40px;
    border-radius: 30px;
}

.newsletter-section {
    padding-bottom: 80px;
}

.container-padding {
    padding-left: 12px;
    padding-right: 12px;
}

hr {
    border: 0;
    border-bottom: 1px solid #cccccc;
}

.hr {
    height: 1px;
    border-bottom: 3px solid #f5f5f5;
    margin: 35px 0;
}

/* INTRODUCTION */

.lead-image {
    height: 300px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    background-size: cover;
    position: relative;
}

.lead-image-credit {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 12px;
    color: #f5f5f5;
    padding: 4px 10px;
    border-radius: 10px;
    text-decoration: none;
    /*background-color: lightgray;*/
    opacity: 0.8;
}

.lead-image-credit:hover {
    color: white;
    text-decoration: underline;
}

.audioxide-emblem {
    width: 15%;
    margin: -50px auto 15px;
    display: block;
    filter: drop-shadow(0 0 0.6rem rgb(90, 90, 90));
}

.month {
    margin-bottom: 0px;
    font-size: 16px;
    font-family: 'Rounded Elegance', sans-serif;
}

/* REVIEWS */

.review-image {
    border-radius: 5px;
}

.review-info {
    padding-left: 30px;
}

.review-album-name {
    font-style: italic;
    margin-bottom: 0px;
}

.review-artist-name {
    font-size: 20px;
}

.review-summary {
    font-family: 'Spectral', serif;
    font-style: italic;
}

.review-divider {
    clear: both;
}

/* ARTICLES */

.article-image {
    border-radius: 5px;
    margin-bottom: 30px;
}

/* INTERVIEWS */

.interview-pullquote {
    font-style: italic;
    font-family: 'Spectral', serif;
}

.interview-image {
    border-radius: 5px;
}

/* INTERVIEWS */

.funnyfarm-image {
    border-radius: 5px;
}

/* ARTWORK STORIES */

.artwork-story-grid-container {
    padding-bottom: 15px;
}

.artwork-story-image {
    border-radius: 5px;
    width: 90%;
}

.artwork-story-image:hover {
    opacity: 0.7;
}

/* SITE DEVELOPMENT */

.site-dev-image {
    margin-bottom: 15px;
}

/* FOOTER */

.footer-text {
    font-size: 12px;
    line-height: 16px;
    color: #aaaaaa;
}
.footer-text a {
    color: #aaaaaa;
}

/* TBD */

a[href^="x-apple-data-detectors:"],
a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
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
    .review-info {
        padding-left: 0;
        padding-top: 20px;
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
