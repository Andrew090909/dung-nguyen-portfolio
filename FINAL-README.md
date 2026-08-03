# DNGWORKS FINAL — DAILY NEWS + LIGHT CUSTOMER SUPPORT

## What changed
- Daily news is updated by GitHub Actions at 17:00 UTC (target ~00:00 GMT+7).
- News update does NOT use Cloudflare AI.
- Customer chat is local-first: services / pricing / portfolio / contact are answered in the browser with zero Cloudflare usage.
- Only questions outside the local FAQ call the existing Cloudflare Worker, in `site` mode only (no web search).
- Browser-side fallback AI is limited to 3 calls/day/browser to reduce Workers AI consumption.
- `insights.html` keeps its existing chat panel but it is now customer support, not a general news AI.
- News-card “Hỏi AI” buttons were removed to avoid unnecessary AI calls.

## Upload
Replace the repository contents with this source (or upload the changed files preserving folders).

## GitHub Actions
After upload, open the repo and click the `Actions` tab. The workflow is named `Daily News Update`.
You can click `Run workflow` once to verify it immediately; after that it runs daily automatically.

## Files that matter
- `.github/workflows/update-news.yml`
- `scripts/update_news.py`
- `data/news.json`
- `assets/js/dng-support-core.js`
- `assets/js/dng-ai-widget.js`
- `assets/js/dng-ai-config.js`
- `assets/css/dng-ai-widget.css`
- `insights.html`
