# Release Notes V19.0.0

## Implemented from V18

### Multilingual routing

- Corrected desktop navigation links that returned EN/ZH users to Vietnamese pages.
- Corrected mobile navigation links with the same defect.
- Corrected language switchers so they retain the current page instead of returning to a language homepage.
- Added/normalized canonical and hreflang metadata on all primary pages.

### Globe integration

- Integrated the V5 code-rendered globe into all 21 primary VI/EN/ZH pages.
- Added page-specific center labels and localized moving capability labels.
- Added hover slowdown, limited pointer following, automatic visibility pause, and reduced-motion behavior.
- Removed dependency on the earlier static-only globe presentation for primary pages.

### Digital visual system

- Added a light animated data background across the complete website.
- Added a common CSS layer to keep the digital canvas below content and preserve readability.
- Avoided the previous dark/space appearance, black panel, and rectangular globe backing.
- Added mobile density and frame-rate reductions.

### Contact form

- Replaced legacy V15/V16 contact transport references with `contact-form-v19.js`.
- Added explicit Apps Script success/failure confirmation instead of optimistic `no-cors` success.
- Added email fallback when no valid endpoint is configured.
- Updated the included Google Apps Script receiver to write to Sheet, send email, and sanitize spreadsheet cells.

### General fixes found during audit

- Confirmed no `admin/` directory exists in source or build output.
- Removed duplicate legacy contact scripts from the post template.
- Corrected invalid local absolute references in `404.html` and the post template.
- Corrected mobile navigation overflow and verified no horizontal overflow on the 21 primary pages.
- Added a V19 static validator and browser QA reports.

## Not represented as completed

- Live Google Sheet/email delivery: blocked by missing deployed Apps Script `/exec` URL.
- Live GitHub Pages deployment and production-domain regression testing: not performed.
- Final real-device performance sign-off: not completed; see `PERFORMANCE-V19.json` and `KNOWN-LIMITATIONS-V19.md`.
