const fetch = require("node-fetch");
const fs = require('fs')
const path = require('path')

// Settings

const from = new Date("2021-01-01").getTime();
const to = new Date("2021-02-01").getTime();

const month = "June"
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
        <title>July 02021 on Audioxide</title>
        <link rel="stylesheet" type="text/css" href="newsletter-styles.css">
    </head>
    
    <body style="margin:0; padding:0;" bgcolor="#F0F0F0" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
    
        <!-- 100% background wrapper (grey background) -->
        <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#F0F0F0">
    
            <tr>
                <td align="center" valign="top" bgcolor="#F0F0F0" style="background-color: #ffffff;">
    
                    <!-- 600px container (white background) -->
                    <table border="0" width="600" cellpadding="0" cellspacing="0" class="container">
    
                        <!-- INTRODUCTION -->
    
                        <tr>
                            <td>
                                <img src="https://thefall.org/news/pics/mpollard_photos/20_nsg.jpg" style="border-bottom-left-radius: 5px;
                                            border-bottom-right-radius: 5px;">
                            </td>
                        </tr>
    
                        <tr>
                            <td>
                                <img src="https://raw.githubusercontent.com/audioxide/brand/main/assets/png/bordered-emblem-black-and-white.png"
                                    style="width: 20%; 
                                           margin-left: auto;
                                           margin-right: auto;
                                           margin-top: -70px; 
                                           display: block; 
                                           filter: drop-shadow(0 0 0.6rem rgb(90, 90, 90));">
                            </td>
                        </tr>
    
                        <tr>
                            <td class="container-padding opening-blurb" align="left">
                                <p style="text-align: center; margin-bottom: -20px;">July 02021</p>
                                <h2>This really is It</h2>
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
    
                        <tr class="spacer">
                            <td>
                                <!-- SPACER -->
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

                    <tr style="background-color: white;">
                        <td class="container-padding">
                            <table>
                                <tr>
                                    <td class="section-header" align="left">
                                        <h3><span class="section-header-wrap">Reviews</span></h3>
                                    </td>
                                </tr>
                                <tr class="spacer">
                                    <td>
                                        <!-- SPACER -->
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

                    <table width="215" border="0" cellpadding="0" cellspacing="0" align="left"
                        class="force-row">
                        <tr>
                            <td class="col" valign="top">
                                <img src="${imageSource}"
                                    alt="Album artwork of '${data[i].metadata.album}' by ${data[i].metadata.artist}"
                                    class="album-artwork" style="border: 3px solid ${primaryColor};">
                            </td>
                        </tr>
                    </table>

                    <!--[if mso]></td><td width="50%" valign="top"><![endif]-->

                    <table width="355" border="0" cellpadding="0" cellspacing="0" align="right"
                        class="force-row">
                        <tr>
                            <td class="col" valign="top">
                                <div class="review-info">
                                    <h4 class="review-album-name" style="color: ${primaryColor};">${data[i].metadata.album}</h4>
                                    <h4>${data[i].metadata.artist}</h4>
                                    <p class="review-summary">‘${data[i].metadata.summary}’</p>
                                    <p><a href="https://audioxide.com/reviews/${data[i].metadata.slug}/">Read full review</a> →</p>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!--[if mso]></td></tr></table><![endif]-->


                    <!--/ end example -->

                    <div class="hr" style="clear: both;">&nbsp;</div>
                </td>
            </tr>      
                `
          )          
      }
    }
    newsletterHtml = newsletterHtml.concat(`
    </table>
                        </td>
                    </tr>

                    <tr class="spacer">
                        <td>
                            <!-- SPACER -->
                        </td>
                    </tr>`)
  });
  
  // Check for and add articles in time range

  await fetch(articlesJson)
  .then(response => response.json())
  .then(data => {
    let tally = data.length - 1;
    newsletterHtml = newsletterHtml.concat(`
    <tr style="background-color: white;">
                        <td class="container-padding">
                            <table>
                                <tr>
                                    <td class="section-header" align="left">
                                        <h3><span class="section-header-wrap">Articles</span></h3>
                                    </td>
                                </tr>
                                <tr class="spacer">
                                    <td>
                                        <!-- SPACER -->
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
              <div class="hr">&nbsp;</div>
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

                    <tr class="spacer">
                        <td>
                            <!-- SPACER -->
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

    <tr style="background-color: white;">
        <td class="container-padding">
            <table>
                <tr>
                    <td class="section-header" align="left">
                        <h3><span class="section-header-wrap">Artwork stories</span></h3>                                    
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce faucibus, est
                            eu tristique
                            molestie, velit sem finibus nibh, interdum tempor felis enim in ante.
                            Maecenas nisi
                            libero, faucibus sit amet augue et, elementum venenatis tellus.</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table>
                            <tr>
                                <td>
                                    <a href="#">
                                        <img src="https://audioxide.com/api/images/album-artwork/this-nations-saving-grace-the-fall-medium-square.jpg"
                                            alt="Album artwork alt text" class="story-artwork"
                                            style="border: 3px solid #6ea375;">
                                    </a>
                                </td>
                                <td>
                                    <a href="#">
                                        <img src="https://audioxide.com/api/images/album-artwork/hello-nasty-beastie-boys-medium-square.jpg"
                                            alt="Album artwork alt text" class="story-artwork" style="border: 3px solid #000000; 
                                                   margin: auto; 
                                                   display: block;">
                                    </a>
                                </td>
                                <td>
                                    <a href="#">
                                        <img src="https://audioxide.com/api/images/album-artwork/the-college-dropout-kanye-west-medium-square.jpg"
                                            alt="Album artwork alt text" class="story-artwork" style="border: 3px solid #3b1415; 
                                                   float: right;">
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce faucibus, est
                            eu tristique
                            molestie, velit sem finibus nibh, interdum tempor felis enim in ante.
                            Maecenas nisi
                            libero, faucibus sit amet augue et, elementum venenatis tellus.</p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>

    <tr class="spacer">
        <td>
            <!-- SPACER -->
        </td>
    </tr>

    <!-- SITE DEVELOPMENT -->

    <tr>
        <td class="container-padding">
            <table>
                <tr>
                    <td class="section-header" align="left">
                        <h3><span class="section-header-wrap">Site development</span></h3>
                    </td>
                </tr>
            
                <tr>
                    <td style="background-color: white;">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce faucibus, est eu tristique
                            molestie, velit sem finibus nibh, interdum tempor felis enim in ante. Maecenas nisi
                            libero, faucibus sit amet augue et, elementum venenatis tellus.</p>
                        <p>Ut ornare velit nec urna gravida dignissim. Integer at ultricies risus. Donec semper
                            luctus augue a pellentesque. Aliquam non tortor at ipsum dictum rhoncus.</p>
                        <img src="https://audioxide-wiki.neocities.org/Images/audioxide-archive-preview.png">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce faucibus, est eu tristique
                            molestie, velit sem finibus nibh, interdum tempor felis enim in ante. Maecenas nisi
                            libero, faucibus sit amet augue et, elementum venenatis tellus.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- FOOTER -->

    <tr>
        <td class="container-padding footer-text" align="left">
            <br><br>
            &copy; Audioxide. All rights reserved. <a href="#">Newsletter powered by EmailOctopus</a>.
            <br><br>

            You are receiving this newsletter because you opted in on our website, or perhaps someone
            with your email address wanted you to suffer. In any case you can <a href="#">unsubscribe
                from this list</a>.
            <br><br>

            <strong>Acme, Inc.</strong><br>
            <span class="ios-footer">
                123 Main St.<br>
                Springfield, MA 12345<br>
            </span>
            <a href="http://www.acme-inc.com">www.acme-inc.com</a><br>

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
/* CUSTOM STYLING. TIDY UP LATER */

@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200;1,300;1,400;1,500;1,600&display=swap');

.section-header {
  text-align: center;
  background-color: white;
  color: #f5f5f5;
  border-radius: 5px;
}

.section-header-wrap {
  background-color: black; 
  padding: 15px 25px; 
  border-radius: 5px; 
  filter: drop-shadow(0 0 0.3rem rgb(90, 90, 90));
}

.opening-blurb {
  background-color: #ffffff;
  line-height: 28px;
  /*
  clip-path: polygon(
    0 0,
    100% 0, 
    100% 100%,
    0 95%
  );
  */
}

.container-padding {
  padding-left: 12px;
  padding-right: 12px;
}

.review-album-name {
  font-style: italic;
}

.review-summary {
  font-family: 'Spectral', serif;
  font-style: italic;
  line-height: 22px;
}

.album-artwork {
  border-radius: 5px;
  margin-bottom: 15px;
}

.story-artwork {
  border-radius: 5px;
  width: 95%;
}

.story-artwork:hover {
  opacity: 0.7;
}

p {
  font-size: 17px;
}

h2 {
  font-size: 28px;
  text-align: center;
}

h3 {
  font-size: 24px;
  text-align: center;
}

h4 {
  font-size: 20px;
  line-height: 24px;
  margin: 5px 0;
}

a, a:visited {
  color: #f01d4f;
}

a:hover {
  color: pink;
}

img {
  -ms-interpolation-mode: bicubic;
  width: 100%;
}

.section {
  padding-bottom: 40px;
}

.spacer {
  background-color: white;
  height: 30px;
}

.article-image {
  border-radius: 5px;
  margin: 0 0 10px 0;
}

.review-info {
  padding-left: 30px;
}

.funnyfarm-image {
  border-radius: 5px;
}

/* ------------------------------------------------------- */

p, h1, h2, h3, h4, h5, h6,
.header,
.title,
.subtitle,
.footer-text {
  font-family: 'Source Sans Pro', sans-serif;
}

.header {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 12px;
  color: #DF4726;
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

.content {
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: #ffffff;
}

code {
  background-color: #eee;
  padding: 0 4px;
  font-family: Menlo, Courier, monospace;
  font-size: 12px;
}

hr {
  border: 0;
  border-bottom: 1px solid #000000;
}

.hr {
  height: 1px;
  border-bottom: 2px solid #f5f5f5;
  margin: 15px 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #374550;
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
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  color: #333333;
}

.col {
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

/* RESPONSIVE */

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
    }
  }
  @media screen and (max-width: 400px) {
    .container-padding {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
    .review-info {
      padding-left: 0;
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
