# Audioxide newsletter generator

Program to pull through site data and generate 90% of monthly newsletters. We currently use Mailchimp, which works fine but is a little tedious to fill in manually. The goal here is to populate a HTML template with content published that month. Ideally all that's left to do will be a quick proof read and introductory paragraph.

- Latest content data: https://api.audioxide.com/latest.json
- All reviews: https://api.audioxide.com/reviews.json

### Resources

- [HTML email basics](https://templates.mailchimp.com/getting-started/html-email-basics/)
- [Where to edit template code](https://mailchimp.com/help/where-to-edit-template-code/)
- [Going fully in-house a la Dense Discovery](https://www.densediscovery.com/notes/behind-the-scenes/)

## Pseudocode

- Check data for content published in a certain month
- For each piece of content in a given section, generate a section of the newsletter
- Spit out HTML template that can be pasted into Mailchimp
