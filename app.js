const selectedCountries = [];
const MAX_COMPARE = 4;
const API_BASE = "https://restcountries.com/v3.1";
const TIMEOUT_MS = 8000; // 8 second timeout
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const compareBtn = document.getElementById("compareBtn");
const resultsEl = document.getElementById("results");
const errorEl = document.getElementById("error-msg");
const loadingEl = document.getElementById("loading");
const comparePanel = document.getElementById("compare-panel");
const compareTableWrap = document.getElementById("compare-table-wrap");
const clearCompareBtn = document.getElementById("clearCompare");

// -Helpers -

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}

function hideError() {
  errorEl.classList.add("hidden");
}

function showLoading() {
  loadingEl.classList.remove("hidden");
  resultsEl.innerHTML = "";
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

// Wrap fetch with a timeout so the app doesn't hang if the API is slow
async function fetchWithTimeout(url, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The API might be slow — try again.");
    }
    throw new Error("Network error. Check your connection.");
  }
}
function formatNumber(n) {
  if (n == null) return "N/A";
  return n.toLocaleString();
}

function getLanguages(country) {
  if (!country.languages) return "N/A";
  return Object.values(country.languages).join(", ");
}

function getCurrencies(country) {
  if (!country.currencies) return "N/A";
  return Object.values(country.currencies)
    .map((c) => `${c.name} (${c.symbol || "?"})`)
    .join(", ");
}

// -- Search --

async function searchCountries(query) {
  // Basic input validation
  const trimmed = query.trim();
  if (!trimmed) {
    showError("Please enter a country name to search.");
    return;
  }
  if (trimmed.length < 2) {
    showError("Search term must be at least 2 characters.");
    return;
  }

  hideError();
  showLoading();

  let data;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/name/${encodeURIComponent(trimmed)}`);
    if (res.status === 404) {
      hideLoading();
      showError(`No countries found matching "${trimmed}". Double-check the spelling.`);
      return;
    }
    if (!res.ok) {
      hideLoading();
      showError(`API error (status ${res.status}). Please try again.`);
      return;
    }

    data = await res.json();
  } catch (err) {
    hideLoading();
    showError(err.message);
    return;
  }

  hideLoading();
  renderCards(data);
}
// -- Render --
function renderCards(countries) {
  resultsEl.innerHTML = "";

  if (!countries || countries.length === 0) {
    resultsEl.innerHTML = "<p>No results.</p>";
    return;
  }
  countries.sort((a, b) =>
    a.name.common.localeCompare(b.name.common)
  );

  countries.forEach((country) => {
    const card = buildCard(country);
    resultsEl.appendChild(card);
  });
}

function buildCard(country) {
  const name = country.name.common;
  const capital = country.capital ? country.capital[0] : "N/A";
  const population = formatNumber(country.population);
  const region = country.region || "N/A";
  const flagUrl = country.flags?.svg || country.flags?.png || "";

  const card = document.createElement("div");
  card.className = "card";

  const isSelected = selectedCountries.some((c) => c.name.common === name);

  card.innerHTML = `
    <img src="${flagUrl}" alt="Flag of ${name}" onerror="this.style.display='none'" />
    <div class="card-body">
      <h3>${name}</h3>
      <p>
        <strong>Capital:</strong> ${capital}<br/>
        <strong>Population:</strong> ${population}<br/>
        <strong>Region:</strong> ${region}
      </p>
    </div>
    <div class="card-actions">
      <button class="compare-toggle ${isSelected ? "selected" : ""}" data-name="${name}">
        ${isSelected ? "✓ Added" : "+ Compare"}
      </button>
    </div>
  `;

  const btn = card.querySelector(".compare-toggle");
  btn.addEventListener("click", () => toggleCompare(country, btn));

  return card;
}

// --- Compare logic --

function toggleCompare(country, btn) {
  const name = country.name.common;
  const idx = selectedCountries.findIndex((c) => c.name.common === name);

  if (idx === -1) {
    if (selectedCountries.length >= MAX_COMPARE) {
      alert(`You can compare up to ${MAX_COMPARE} countries at a time.`);
      return;
    }
    selectedCountries.push(country);
    btn.textContent = "✓ Added";
    btn.classList.add("selected");
  } else {
    selectedCountries.splice(idx, 1);
    btn.textContent = "+ Compare";
    btn.classList.remove("selected");
  }

  compareBtn.textContent = `Compare (${selectedCountries.length})`;
}

compareBtn.addEventListener("click", () => {
  if (selectedCountries.length < 2) {
    alert("Select at least 2 countries to compare.");
    return;
  }
  renderCompareTable();
  comparePanel.classList.remove("hidden");
  comparePanel.scrollIntoView({ behavior: "smooth" });
});

function renderCompareTable() {
  const fields = [
    { label: "Capital", fn: (c) => c.capital?.[0] ?? "N/A" },
    { label: "Population", fn: (c) => formatNumber(c.population) },
    { label: "Region", fn: (c) => c.region ?? "N/A" },
    { label: "Subregion", fn: (c) => c.subregion ?? "N/A" },
    { label: "Area (km²)", fn: (c) => formatNumber(c.area) },
    { label: "Languages", fn: getLanguages },
    { label: "Currencies", fn: getCurrencies },
    { label: "Timezones", fn: (c) => c.timezones?.join(", ") ?? "N/A" },
    { label: "UN Member", fn: (c) => (c.unMember ? "Yes" : "No") },
  ];

  let html = "<table><thead><tr><th>Field</th>";
  selectedCountries.forEach((c) => {
    html += `<th>${c.name.common}</th>`;
  });
  html += "</tr></thead><tbody>";

  fields.forEach(({ label, fn }) => {
    html += `<tr><td>${label}</td>`;
    selectedCountries.forEach((c) => {
      html += `<td>${fn(c)}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  compareTableWrap.innerHTML = html;
}

clearCompareBtn.addEventListener("click", () => {
  selectedCountries.length = 0;
  compareBtn.textContent = "Compare (0)";
  comparePanel.classList.add("hidden");
  // Reset any "Added" buttons on cards
  document.querySelectorAll(".compare-toggle.selected").forEach((btn) => {
    btn.textContent = "+ Compare";
    btn.classList.remove("selected");
  });
});

searchBtn.addEventListener("click", () => {
  searchCountries(searchInput.value);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchCountries(searchInput.value);
  }
});
// --- Load a default on startup so the page isn't empty ---
searchInput.value = "india";
searchCountries("india");
