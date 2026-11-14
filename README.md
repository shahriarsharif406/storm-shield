# Storm-Shield

**Satellite rain data → a spoken flood-risk alert and drill any school can act on.**
Existing flood tools are built for experts and dashboards. Storm-Shield is the last mile: for teachers, children and families. It estimates **rain-driven flood and waterlogging risk** (it is not a cyclone-track forecast). Pick a school, get a 0–100 risk level, hear the alert in your language, and follow a short safety checklist. No sign-up, no API keys, runs in the browser.

Built for **STEMergent Hacks 2026** (Hackathon pathway).

## The problem
Schools in cyclone- and flood-prone areas often get warnings that are late, technical, or not in the language students and parents speak. Many places have little or no local early-warning infrastructure, but satellites already measure rainfall everywhere.

## What it does
1. **Satellite rainfall:** pulls the last 7 days of rainfall for the school's coordinates from the NASA POWER API (satellite-derived precipitation).
2. **Risk score:** combines 7-day total, the wettest day, and a 3-day forecast (Open-Meteo) into a transparent 0–100 score: low, elevated, or high.
3. **Spoken alert:** plain-language message in **English, বাংলা, Español, हिन्दी**, read aloud with the browser's speech synthesis (needs a voice for that language on the device; the text is always shown).
4. **Checklist and quiz:** actions that change with the risk level, plus a two-question safety quiz for children.
5. **Works without a smartphone or internet:** a ready-to-send SMS text (copy or open in the SMS app) and a one-page printable poster to pin on the school wall. The last live result is saved on the device, so it still opens offline.
6. **Practice drill:** a 5-minute timed rehearsal of the high-risk steps, so schools practise before the storm. It needs no data and works offline.
7. **School calibration:** a teacher enters the rainfall that last flooded the school (7-day and one-day totals). The score is then measured against the school's own flood history instead of the generic 120 mm / 70 mm marks, shows "% of your flood mark", and is saved on the device per place.

Pilot locations are coastal and river areas of Bangladesh (Hatiya, Bhola, Cox's Bazar, Koyra, Sunamganj). Any coordinates worldwide work, and there is a "use my location" button.

## How the score works
`score = 45% × (7-day rain ÷ 120 mm) + 30% × (wettest day ÷ 70 mm) + 25% × (3-day forecast ÷ 80 mm)`, each term capped at 1. The 120 / 70 mm marks are defaults; a school can replace them with its own flood marks (the forecast mark scales with the weekly one). If the forecast is unavailable, the first two terms are rescaled. Below 35 = low, 35–64 = elevated, 65+ = high.
The thresholds are deliberately simple so a teacher can understand them. They are **not** official warning criteria.

## Limits (honest)
- It is an awareness aid, **not an official warning**. Always follow national weather services and local authorities.
- NASA POWER daily data lags by a few days, so the forecast term matters for "now". If the live data cannot be reached from the browser, the app clearly labels the numbers as **DEMO**.
- Default thresholds are generic. Schools can calibrate them with their own flood history, but the numbers they enter are self-reported and not validated against official records. Next step: validate with local flood records and add real SMS/WhatsApp delivery (today the app prepares the text; it does not send it).
- Sentinel-1 flood-extent maps are planned (see [mapaction/flood-mapping-tool](https://github.com/mapaction/flood-mapping-tool) for the approach) but are **not** part of this prototype.

## Run it
Static site: open `index.html`, or serve the folder (`python3 -m http.server`). Live demo via GitHub Pages.

Tests for the scoring and parsing logic: `node -e "const {computeRisk}=require('./app.js');console.log(computeRisk(136,55,null))"`

## AI and third-party disclosure
- Code written with the help of **Claude (Anthropic)** via Claude Code; the author reviewed and directs the project. The risk score is rule-based, not a machine-learning model.
- Data/APIs: NASA POWER (CC BY 4.0), Open-Meteo. No other libraries.

## License
MIT
