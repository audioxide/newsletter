`<table width="204" border="0" cellpadding="0" cellspacing="0" align="left" class="force-row">\n
                  <tr>\n
                    <td class="col" valign="top">\n
                      <img class="album-artwork"\n
                        src=${data[i].metadata.featuredimage.medium-square}\n
                        style="border: 3px solid ${data[i].metadata.colors[0]};">\n
                    </td>\n
                  </tr>\n
                </table>\n

                <table width="284" border="0" cellpadding="0" cellspacing="0" align="right" class="force-row">\n
                  <tr>\n
                    <td class="col" valign="top">\n
                      <h3 class="review-album" style="color: ${data[i].metadata.colors[0]};">${data[i].metadata.album}</h3>\n
                      <h3 class="review-artist">${data[i].metadata.artist}</h3>\n
                      <p class="review-summary">‘${data[i].metadata.summary}’</p>\n
                      <span class="review-link"><a href="https://audioxide.com/reviews/${data[i].metadata.slug}/">Full
                          review</a> →</span>\n
                    </td>\n
                  </tr>\n
                </table>\n`