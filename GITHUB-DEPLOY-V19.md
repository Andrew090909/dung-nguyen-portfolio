# GitHub Pages Deployment Checklist V19

This package has not been deployed to the live repository.

## Recommended safe deployment

1. Download or clone the current repository as a backup.
2. Use the contents of the V19 deploy-ready ZIP as the GitHub Pages root.
3. Commit all additions and modifications.
4. Explicitly delete any old `admin/` directory from the repository. Uploading new files does not automatically delete files that are no longer in the package.
5. Confirm `.nojekyll` is present.
6. Wait for the GitHub Pages workflow to finish.
7. Hard-refresh the site or test in a private window.

## Required live regression URLs

Test each language and page type:

- `/`
- `/portfolio.html`
- `/pricing.html`
- `/pricing-marketing.html`
- `/pricing-video.html`
- `/insights.html`
- `/contact.html`
- `/en/` and the six matching EN pages
- `/zh/` and the six matching ZH pages
- `/admin/` must return 404 and must not expose old files

## Required live checks

- Menu remains in the current language.
- Language switch keeps the same page type.
- Globe rotates and slows/follows the pointer.
- Mobile navigation has no horizontal overflow.
- Digital background remains subtle behind text and cards.
- Contact form remains marked unverified until the Apps Script endpoint is configured and one real test lead reaches both Sheet and Inbox.
