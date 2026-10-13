const DB_NAME = "LedgerDB";
const STORE_NAME = "transactions";
let db = null;

// --- Currency display settings (Phase 1: formatting only, no conversion) ---
const SUPPORTED_CURRENCIES = {
    INR: { locale: "en-IN", label: "INR (₹) — India" },
    USD: { locale: "en-US", label: "USD ($) — United States" },
    EUR: { locale: "en-IE", label: "EUR (€) — Eurozone" },
    GBP: { locale: "en-GB", label: "GBP (£) — United Kingdom" },
    JPY: { locale: "ja-JP", label: "JPY (¥) — Japan" },
};
const CURRENCY_STORAGE_KEY = "ledger:currency";
let activeCurrency = "USD";

function getSavedCurrency() {
    try {
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (saved && SUPPORTED_CURRENCIES[saved]) return saved;
    } catch (e) {
        // Storage unavailable (private mode); fall through to default.
    }
    return "USD";
}

function saveCurrency(code) {
    try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch (e) {
        // Storage disabled or blocked; setting still applies for this session.
    }
}

// Format a stored plain-number amount for display only.
// Intl.NumberFormat handles symbols, grouping (e.g. ₹1,00,000 vs $100,000)
// and zero-decimal currencies like JPY automatically.
function formatAmount(value) {
    const num = Number(value);
    const safe = Number.isFinite(num) ? num : 0;
    const code = SUPPORTED_CURRENCIES[activeCurrency] ? activeCurrency : "USD";
    const locale = SUPPORTED_CURRENCIES[code].locale;
    try {
        return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(safe);
    } catch (e) {
        return `${code} ${safe.toFixed(2)}`;
    }
}

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };
    });
}

// DB Operations
function addTransaction(tx) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(tx);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getTransactions() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteTransaction(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// UI & ML Integration
const descInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const form = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const totalSpentEl = document.getElementById("total-spent");
const forecastSpentEl = document.getElementById("forecast-spent");
const budgetAdviceEl = document.getElementById("budget-advice");
const expenseChartEl = document.getElementById("expense-chart");

let classifyTimeout = null;

descInput.addEventListener("input", () => {
    clearTimeout(classifyTimeout);
    const desc = descInput.value.trim();
    if (!desc) {
        categoryInput.value = "";
        return;
    }
    classifyTimeout = setTimeout(async () => {
        try {
            const res = await fetch("/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: desc })
            });
            const data = await res.json();
            if (data.category) {
                categoryInput.value = data.category;
            }
        } catch (err) {
            console.error("Classification error:", err);
        }
    }, 300);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim() || "General";
    const date = new Date().toISOString();

    if (!description || isNaN(amount)) return;

    await addTransaction({ description, amount, category, date });
    form.reset();
    categoryInput.value = "";
    await loadData();
});

async function removeTx(id) {
    await deleteTransaction(id);
    await loadData();
}

async function loadData() {
    const txs = await getTransactions();
    
    // Render list
    if (txs.length === 0) {
        transactionList.innerHTML = `<p class="empty-state">No transactions recorded yet.</p>`;
    } else {
        transactionList.innerHTML = txs.reverse().map(tx => `
            <div class="transaction-item">
                <div class="tx-info">
                    <span class="tx-desc">${escapeHtml(tx.description)}</span>
                    <span class="tx-cat">${escapeHtml(tx.category)}</span>
                </div>
                <div class="tx-right">
                    <span class="tx-amount">$${tx.amount.toFixed(2)}</span>
                    <button class="btn-delete" onclick="removeTx(${tx.id})">&times;</button>
                </div>
            </div>
        `).join("");
    }

    // Calculate total spent
    const total = txs.reduce((sum, tx) => sum + tx.amount, 0);
    totalSpentEl.textContent = `$${total.toFixed(2)}`;

    // Render Category Breakdown Chart
    if (txs.length === 0) {
        expenseChartEl.innerHTML = `<p class="empty-state">No data for chart yet.</p>`;
    } else {
        const categoryMap = {};
        txs.forEach(tx => {
            const cat = tx.category || "General";
            categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
        });
        
        expenseChartEl.innerHTML = Object.entries(categoryMap).map(([cat, amt]) => {
            const pct = total > 0 ? (amt / total) * 100 : 0;
            return `
                <div class="chart-bar-row">
                    <div class="chart-bar-meta">
                        <span>${escapeHtml(cat)}</span>
                        <span>$${amt.toFixed(2)} (${pct.toFixed(0)}%)</span>
                    </div>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Group by month for forecasting (mock grouping by index for simplicity)
    // In a real app, group by YYYY-MM
    if (txs.length > 0) {
        // Create dummy monthly history based on totals or entries
        const history = [total * 0.8, total * 0.9, total]; 
        try {
            const res = await fetch("/forecast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history })
            });
            const data = await res.json();
            forecastSpentEl.textContent = `$${data.forecast.toFixed(2)}`;
            
            if (data.forecast > total * 1.2) {
                budgetAdviceEl.textContent = `💡 Suggestion: Spending is trending upward. Consider reducing discretionary categories like Entertainment and Shopping.`;
            } else {
                budgetAdviceEl.textContent = `✨ Suggestion: Your spending is stable and well-balanced. Keep it up!`;
            }
        } catch (err) {
            console.error("Forecast error:", err);
        }
    } else {
        forecastSpentEl.textContent = `$0.00`;
        budgetAdviceEl.textContent = `Add transactions to receive AI budget suggestions.`;
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Initialize on load
initDB().then(() => {
    loadData();
}).catch(err => console.error("IndexedDB init failed:", err));

// Theme Toggle & OS Preference
function getSavedTheme() {
    try {
        return localStorage.getItem("theme");
    } catch (e) {
        return null;
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch (e) {
        // Storage disabled or blocked
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        const isLight = theme === "light";
        toggleBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
        toggleBtn.setAttribute("aria-pressed", isLight ? "true" : "false");
    }
}

const themeToggleBtn = document.getElementById("theme-toggle");
if (themeToggleBtn) {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(currentTheme);

    themeToggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        const next = current === "light" ? "dark" : "light";
        saveTheme(next);
        applyTheme(next);
    });
}

const systemThemeMedia = window.matchMedia("(prefers-color-scheme: light)");
const onSystemThemeChange = (e) => {
    if (!getSavedTheme()) {
        applyTheme(e.matches ? "light" : "dark");
    }
};

if (systemThemeMedia.addEventListener) {
    systemThemeMedia.addEventListener("change", onSystemThemeChange);
} else if (systemThemeMedia.addListener) {
    systemThemeMedia.addListener(onSystemThemeChange);
}

