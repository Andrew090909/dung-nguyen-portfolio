# QA Summary V19

## Automated static validation

- Primary pages checked: 21
- Globe-enabled primary pages: 21
- HTML documents with global digital background: 23
- Missing primary pages: 0
- Broken local references detected: 0
- Duplicate script references detected: 0
- Legacy contact-form script references detected: 0
- `admin/` present: No

## Browser regression

Browser checks were executed in local headless Chromium against all 21 primary pages.

### Desktop

- Pages checked: 21
- Failures: 0
- Globe texture initialized: Yes on all checked pages
- Horizontal overflow failures: 0

### Mobile

- Pages checked: 21
- Failures: 0
- Globe texture initialized: Yes on all checked pages
- Horizontal overflow failures: 0
- Mobile navigation toggle visible: Yes
- Hero layout displacement failure: 0

Detailed machine-readable reports:

- `BROWSER-QA-V19-DESKTOP.json`
- `BROWSER-QA-V19-MOBILE.json`
- `QA-REPORT-V19.json`

## Contact-form verification

Code-level checks passed, but end-to-end delivery was not executable because `form_endpoint` is blank. The following were therefore **not verified**:

- a row appearing in the target Google Sheet;
- an email arriving at `nguyendhungdung@gmail.com`;
- permissions and quota behavior of the deployed Apps Script;
- callback behavior on the live GitHub Pages origin.

## Performance reference

The package includes a local headless Chromium reference, not a Lighthouse audit or physical-device benchmark.

- Mobile frame sample was within a 60 FPS interval in the recorded run.
- Desktop CPU/headless frame pacing exceeded a 30 FPS budget in the recorded run.

This is recorded as a risk rather than hidden as a pass. Production sign-off requires testing after deployment using Chrome DevTools/Lighthouse and at least one ordinary Windows laptop, one Android phone, and one iPhone.
