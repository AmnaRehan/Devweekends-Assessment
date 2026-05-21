# Country Explorer
A simple web app to search and compare countries using the [REST Countries API](https://restcountries.com/).
No API key needed. Works entirely in the browser.
---

## How to Run
**Option 1 : Open directly (simplest)**
Just open `index.html` in any browser. Done.
```
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```
**Option 2 : Local server (recommended to avoid any CORS quirks)**
If you have Python installed:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.
Or with Node.js:
```bash
npx serve .
```
---
## Features
- Search any country by name
- See flag, capital, population, and region on cards
- Select up to 4 countries and compare them side by side (population, area, languages, currencies, timezones, and more)
- Handles API timeouts (8 seconds), HTTP errors, and bad user input
---
## No API Key Required
REST Countries is completely free and open , no signup, no key.
---
## Project Structure
```
country-explorer/
├── index.html   # markup
├── style.css    # styles
├── app.js       # all the logic
├── README.md
└── ANSWERS.md
```
