# Activate Google Sheet and Email Delivery

The source is prepared for Google Apps Script, but it is not connected until a deployed Web App URL is added.

## 1. Prepare the Sheet

Use the intended Google Sheet and either:

- open Extensions → Apps Script from that Sheet, or
- use a standalone Apps Script project and set a Script Property named `SPREADSHEET_ID` to the target spreadsheet ID.

## 2. Add the receiver

Copy the contents of:

`scripts/google-apps-script-contact.gs`

into the Apps Script project.

The receiver creates or uses a tab named `Website Leads` and emails:

`nguyendhungdung@gmail.com`

## 3. Deploy

Deploy as a Web App:

- Execute as: Me
- Who has access: Anyone

Copy the deployed URL ending in `/exec`.

## 4. Configure the website

Edit `content/site-config.json`:

```json
{
  "form_endpoint": "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
}
```

Rebuild the site after saving the value.

## 5. Required end-to-end test

Submit one test lead from the deployed Contact page and verify all of the following:

1. The browser displays success only after the Apps Script callback.
2. One row is added to the `Website Leads` tab.
3. One email arrives at `nguyendhungdung@gmail.com`.
4. The email Reply-To value matches the visitor's email.
5. VI, EN, and ZH Contact pages submit successfully.
6. A spreadsheet-formula payload beginning with `=`, `+`, `-`, or `@` is stored as text.
7. The hidden honeypot field rejects bot submissions.

Until this test passes, the form status remains `NOT CONNECTED / NOT VERIFIED`.
