# QA Notes — V19.1 Insights Patch

## Passed locally

- JavaScript syntax: 3/3 files passed `node --check`.
- Content JSON: parsed successfully; 6 published articles.
- Pages CMS YAML: parsed successfully.
- Local links/assets: no missing path detected against V19 base + patch.
- Desktop code render: Insights listing and article detail rendered.
- Mobile code render: 390 px viewport; hero/globe stacked without horizontal overflow.
- VI/EN/ZH listing and detail templates are present.

## Not fully verified

- TradingView end-to-end data loading was not verified in the isolated render environment. The code and fallback are present; confirm after GitHub Pages deployment.
- Pages CMS GitHub sign-in and save operation were not executed because that requires the repository owner's session.
- Dynamic article URLs use query parameters, so SEO is not equal to separate static HTML pages.

## Existing V19 issue outside this patch

- On mobile, the left Call button in the fixed contact bar has no visible label. This already exists in V19 and was not changed because this is an Insights-only patch.

## Not included

- Automatic news ingestion by RSS/API.
- Real-estate listing module.
- Changes to Home, Portfolio, Pricing, Contact, globe V5, admin removal or contact form.
