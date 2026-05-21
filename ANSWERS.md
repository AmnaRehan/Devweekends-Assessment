# ANSWERS.md
---
## 1. How to Run
Open `index.html` directly in a browser. no install needed.
If you want a local server (avoids any browser CORS warnings):
```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```
No API key. No dependencies to install. The REST Countries API is free and open.
---
## 2. Stack Choice
Plain HTML, CSS, and vanilla JavaScript, no framework, no build step.
I chose this because the task is essentially: take user input -> call an API -> display data. That doesn't need React or a bundler. Adding those would just mean more setup for whoever runs it, and more moving parts for something this size.
A worse choice would have been a backend framework like Express or Flask. There's no reason to run a server for this,everything happens in the browser. It would also mean whoever runs it needs Node or Python set up and has to remember to start the server first, which is extra friction for no gain.
---
## 3. One Real Edge Case
Slow or hanging API request — handled with a timeout.

File: `app.js`, lines 26–40 (the `fetchWithTimeout` function).
The REST Countries API is usually fast, but if it hangs, the default `fetch()` will wait indefinitely and the user sees a loading spinner forever with no feedback.
`fetchWithTimeout` uses `AbortController` to cancel the request after 8 seconds and throws an error with a clear message: "Request timed out. The API might be slow, try again."
Without this, a slow API response would leave the user stuck on a loading screen with no way to know what's happening or that they should try again.

---

## 4. AI Usage

I consulted Claude (claude.ai) for some explanations during this project.

**What I asked and what it gave me:**
- Asked for a quick explanation of `AbortController` and how to use it with `fetch` to implement a timeout. It gave me a working example using `setTimeout` + `controller.abort()`.
- Asked for a reminder of how `toLocaleString()` formats numbers, since I always forget the exact syntax.

- Asked it to structure my readme file for better understanding of project structure
**What I changed:**
The original timeout code the AI suggested threw a generic `Error("Timeout")`. I changed the error message to something user-facing: *"Request timed out. The API might be slow. try again."* The AI's version was fine for a dev console but not something you'd show a user directly. I also moved the `clearTimeout(timer)` call to run on both success and failure paths, the original only cleared it on success, which would leave a dangling timer if the fetch failed for a non-timeout reason. It also gave me representation of project structure to put in readme.
---

## 5. Honest Gap
The search only does a name lookup, there's no way to browse by region, filter by population size, or sort the results. Right now if you search "united" you get a list but can't narrow it down further without a new search.
With another day(if i didnt have finals)  I'd add a region filter dropdown (the API has a `/region/{region}` endpoint) and basic sort controls (by population, by area, alphabetically). That would make the comparison feature much more useful because you could say "show me all South Asian countries" and compare them directly, instead of having to search for each one individually.
