# Known Limitations and Blockers V19

## Blocker: form endpoint is not configured

`content/site-config.json` contains an empty `form_endpoint`. The site therefore cannot be certified as sending to Google Sheet or email. The code falls back to opening the visitor's email application.

## Production deployment not tested

This package was not committed or deployed to the live GitHub Pages repository. CDN caching, repository path behavior, Content Security Policy, and live-origin form callbacks were not verified.

## Performance requires real-device sign-off

The rotating globe performs per-pixel sphere rendering on Canvas. Mobile density and frame rate are reduced, but a local CPU/headless desktop run recorded frame pacing above a 30 FPS budget. This does not prove that an ordinary GPU-enabled browser will perform poorly, but it prevents an honest final performance pass.

Before production approval:

- run Lighthouse in deployed Chrome;
- inspect Main-thread and Long Tasks in DevTools Performance;
- test a mid-range Windows laptop;
- test Android Chrome;
- test iPhone Safari;
- confirm acceptable battery and thermal behavior for a two-minute session.

## Portfolio preview versus source

The source retains its Portfolio password gate. Any portfolio screenshot generated with the gate temporarily hidden was for visual QA only and does not alter the packaged source behavior.
