# Highland Watch

A dependency-free weather and news dashboard for Grantown-on-Spey: vanilla JavaScript and CSS, with a small Cloudflare Worker to aggregate external feeds without browser CORS problems.

Run `node dev.mjs` for local development, or `node build.mjs` to produce `dist/client` assets and `dist/server/index.js`.

Sources: Open-Meteo modelled weather at 57.3305, -3.608; Met Office Highlands & Eilean Siar warning feed; BBC Highlands & Islands RSS headlines. Conditions are not a town weather-station observation. Warnings have regional scope. News is restricted to the last seven days and sorted by nearby-place and disruption/safety keywords. This is a useful screening aid, not comprehensive emergency coverage. Direct Traffic Scotland, SEPA and Police Scotland links provide additional checks.

Sources load independently with ten-second timeouts and five-minute edge caching. The interface refreshes every ten minutes while visible, supports manual refresh, and shows unavailable-source states. No credentials or paid API keys are needed for personal use.
