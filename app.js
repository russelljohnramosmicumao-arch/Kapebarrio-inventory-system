const STORAGE_KEY = "kape-barrio-inventory-v1";

let inventory = loadInventory();
let selectedId = null;
let selectedCategoryId = INVENTORY_SEED[0]?.id || null;
let keypadValue = "";
let activeTab = "inventory";
let outOfStockPending = false;
let previousLowOnly = false;

const DAY_KEY = "kape-barrio-inventory-day-v1";
const PREVIOUS_KEY = "kape-barrio-inventory-previous-v1";

const $ = (id) => document.getElementById(id);

function normalizeSupplier(value) {
  const supplier = String(value || "").trim();
  if (!supplier) return "";
  // Keep all TikTok-related suppliers together in one ordering group.
  if (/^tiktok\b/i.test(supplier) || /tiktok/i.test(supplier)) return "Tiktok Shop";
  return supplier;
}

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function cloneInventory(data) {
  return data.map(item => ({ ...item }));
}

function ensureDailyRollover() {
  const today = localDateKey();
  const storedDay = localStorage.getItem(DAY_KEY);
  if (!storedDay) {
    localStorage.setItem(DAY_KEY, today);
    return;
  }
  if (storedDay === today) return;

  // Preserve the last completed day's inventory before starting a fresh day.
  const snapshot = cloneInventory(inventory);
  localStorage.setItem(PREVIOUS_KEY, JSON.stringify({ date: storedDay, items: snapshot }));

  inventory = buildSeedInventory().map(item => ({
    ...item,
    lastInventory: null,
    orderStatus: false,
    outOfStock: false,
    supplier: normalizeSupplier(item.supplier || "")
  }));
  saveInventory();
  localStorage.setItem(DAY_KEY, today);
  selectedId = null;
  selectedCategoryId = INVENTORY_SEED[0]?.id || null;
  keypadValue = "";
  outOfStockPending = false;
}

function loadInventory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const savedById = new Map(data.map(item => [item.id, item]));
      const seed = buildSeedInventory();

      const merged = seed.map(seedItem => {
        const existing = savedById.get(seedItem.id);
        return existing
          ? {
              ...seedItem,
              ...existing,
              lastInventory: existing.lastInventory || null,
              orderStatus: Boolean(existing.orderStatus),
              outOfStock: Boolean(existing.outOfStock),
              supplier: normalizeSupplier(existing.supplier || seedItem.supplier || "")
            }
          : { ...seedItem, lastInventory: null, orderStatus: false, outOfStock: false };
      });

      const seedIds = new Set(seed.map(item => item.id));
      const legacyItems = data
        .filter(item => !seedIds.has(item.id))
        .map(item => ({
          ...item,
          lastInventory: item.lastInventory || null,
          orderStatus: Boolean(item.orderStatus),
          outOfStock: Boolean(item.outOfStock),
          supplier: normalizeSupplier(item.supplier || "")
        }));

      const result = [...merged, ...legacyItems].map(item => ({
        ...item,
        supplier: normalizeSupplier(item.supplier || "")
      }));
      saveInventory(result);
      return result;
    }
  } catch (e) {
    console.warn("Could not read saved inventory.", e);
  }

  const fresh = buildSeedInventory().map(item => ({
    ...item,
    lastInventory: null,
    orderStatus: false,
    outOfStock: false,
    supplier: normalizeSupplier(item.supplier || "")
  }));
  saveInventory(fresh);
  return fresh;
}

function saveInventory(data = inventory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isLow(item) {
  return Number(item.stock) <= Number(item.threshold);
}

function isChecked(item) {
  return Boolean(item.lastInventory);
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function formatDateTime(timestamp) {
  if (!timestamp) return "Not yet recorded";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function render() {
  renderCategoryPane();
  renderCategories();
  updateLowCount();

  $("inventoryTab").classList.toggle("active", activeTab === "inventory");
  $("lowStocksTab").classList.toggle("active", activeTab === "low");
  $("appShell").classList.toggle("low-mode", activeTab === "low" || activeTab === "previous");

  if (activeTab === "low") {
    showEmpty();
    return;
  }
  if (activeTab === "previous") {
    showEmpty();
    return;
  }

  if (selectedId) {
    const selected = inventory.find(i => i.id === selectedId);
    if (selected) updateEditor(selected);
    else showEmpty();
  } else {
    showEmpty();
  }
}

function renderCategoryPane() {
  const container = $("categoryPane");
  container.innerHTML = "";

  INVENTORY_SEED.forEach(category => {
    const items = inventory.filter(item => item.categoryId === category.id);
    const checkedCount = items.filter(isChecked).length;
    const allChecked = items.length > 0 && checkedCount === items.length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-nav-item ${selectedCategoryId === category.id ? "active" : ""}`;
    button.innerHTML = `
      <span class="category-nav-copy">
        <span class="category-nav-name">${escapeHtml(category.name)}</span>
        <span class="category-progress">${checkedCount} out of ${items.length}</span>
      </span>
      ${allChecked ? '<span class="category-check" aria-label="All ingredients checked">✓</span>' : ''}
    `;
    button.addEventListener("click", () => {
      selectedCategoryId = category.id;
      renderCategoryPane();
      renderCategories();
    });
    container.appendChild(button);
  });
}

function renderCategories() {
  const container = $("categoryList");
  container.innerHTML = "";

  if (activeTab === "low") {
    renderLowStocks(container);
    return;
  }
  if (activeTab === "previous") {
    renderPreviousInventory(container);
    return;
  }

  const category = INVENTORY_SEED.find(c => c.id === selectedCategoryId) || INVENTORY_SEED[0];
  if (!category) return;

  const items = inventory.filter(item => item.categoryId === category.id);
  const wrapper = document.createElement("div");
  wrapper.className = "category single-category";

  items.forEach(item => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `ingredient-row ${selectedId === item.id ? "selected" : ""} ${isLow(item) ? "low" : ""}`;
    row.innerHTML = `
      <span class="item-main">
        ${isChecked(item) ? '<span class="item-check" aria-label="Updated">✓</span>' : ''}
        <strong>${escapeHtml(item.name)}</strong>
      </span>
      <span class="item-stock ${item.outOfStock ? "out-stock-text" : ""}">
        <strong>${item.outOfStock ? "OUT OF STOCK" : formatNumber(item.stock)}</strong>
        ${item.outOfStock ? "" : `<small>${escapeHtml(item.unit)}</small>`}
      </span>
      ${isLow(item) ? '<span class="warning-dot">!</span>' : ""}
    `;
    row.addEventListener("click", () => selectItem(item.id));
    wrapper.appendChild(row);
  });

  container.appendChild(wrapper);
}

function renderLowStocks(container) {
  const lowItems = inventory.filter(isLow).sort((a, b) => {
    const sa = (a.supplier || "Unassigned").trim() || "Unassigned";
    const sb = (b.supplier || "Unassigned").trim() || "Unassigned";
    return sa.localeCompare(sb) || a.name.localeCompare(b.name);
  });

  if (!lowItems.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = "<strong>No low-stock items.</strong><span>Everything is currently above its threshold.</span>";
    container.appendChild(empty);
    return;
  }

  const title = document.createElement("div");
  title.className = "category-header category-header-static low-full-header";
  title.innerHTML = `<div class="category-title"><strong>Low Stocks</strong><span>${lowItems.length} ${lowItems.length === 1 ? "item" : "items"}</span></div>`;
  container.appendChild(title);

  const columnHeader = document.createElement("div");
  columnHeader.className = "low-columns";
  columnHeader.innerHTML = `
    <span>Ingredient</span>
    <span>Last Inventory</span>
    <span>Remaining Stock</span>
    <span>Order Status</span>
  `;
  container.appendChild(columnHeader);

  let currentSupplier = null;
  lowItems.forEach(item => {
    const supplier = (item.supplier || "Unassigned").trim() || "Unassigned";
    if (supplier !== currentSupplier) {
      currentSupplier = supplier;
      const supplierHeader = document.createElement("div");
      supplierHeader.className = "supplier-group-header";
      supplierHeader.textContent = supplier;
      container.appendChild(supplierHeader);
    }

    const row = document.createElement("div");
    row.className = "low-stock-row";
    row.innerHTML = `
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(formatDateTime(item.lastInventory))}</span>
      <span class="remaining-stock ${item.outOfStock ? "out-stock-text" : ""}">${item.outOfStock ? "OUT OF STOCK" : `${formatNumber(item.stock)} ${escapeHtml(item.unit)}`}</span>
      <span class="order-cell"></span>
    `;

    const orderButton = document.createElement("button");
    orderButton.type = "button";
    orderButton.className = `ordered-btn ${item.orderStatus ? "is-ordered" : ""}`;
    orderButton.textContent = "Ordered";
    orderButton.setAttribute("aria-pressed", String(Boolean(item.orderStatus)));
    orderButton.addEventListener("click", (event) => {
      event.stopPropagation();
      item.orderStatus = !item.orderStatus;
      saveInventory();
      renderCategories();
      showToast(item.orderStatus ? `${item.name} marked Ordered.` : `${item.name} marked not ordered.`);
    });

    row.querySelector(".order-cell").appendChild(orderButton);
    container.appendChild(row);
  });
}

function getPreviousSnapshot() {
  try {
    const raw = localStorage.getItem(PREVIOUS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderPreviousInventory(container) {
  const snapshot = getPreviousSnapshot();
  const items = snapshot?.items || [];
  const filtered = previousLowOnly ? items.filter(isLow) : items;

  const title = document.createElement("div");
  title.className = "category-header category-header-static low-full-header previous-header";
  title.innerHTML = `
    <div class="category-title"><strong>Previous Inventory</strong><span>${snapshot ? `Inventory from ${escapeHtml(snapshot.date)}` : "No previous inventory yet"}</span></div>
    <div class="previous-actions">
      <button type="button" class="previous-filter ${previousLowOnly ? "active" : ""}" id="previousFilterBtn">${previousLowOnly ? "Showing Low Stock" : "Filter: Low Stock"}</button>
      <button type="button" class="today-inventory-btn" id="todayInventoryBtn">Today's Inventory</button>
    </div>
  `;
  container.appendChild(title);

  if (!snapshot) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = "<strong>No previous inventory yet.</strong><span>Complete an inventory today and it will appear here after the next midnight reset.</span>";
    container.appendChild(empty);
    return;
  }

  const columnHeader = document.createElement("div");
  columnHeader.className = "low-columns";
  columnHeader.innerHTML = `
    <span>Ingredient</span>
    <span>Last Inventory</span>
    <span>Remaining Stock</span>
    <span>Order Status</span>
  `;
  container.appendChild(columnHeader);

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = "<strong>No low-stock items.</strong><span>Turn off the filter to view the complete previous inventory.</span>";
    container.appendChild(empty);
  } else {
    filtered.forEach(item => {
      const row = document.createElement("div");
      row.className = "low-stock-row";
      const stockText = item.outOfStock ? "OUT OF STOCK" : `${formatNumber(item.stock)} ${escapeHtml(item.unit)}`;
      row.innerHTML = `
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(formatDateTime(item.lastInventory))}</span>
        <span class="remaining-stock ${item.outOfStock ? "out-stock-text" : ""}">${stockText}</span>
        <span class="order-cell"><span class="previous-order-status ${item.orderStatus ? "is-ordered" : ""}">${item.orderStatus ? "Ordered" : "Not Ordered"}</span></span>
      `;
      container.appendChild(row);
    });
  }

  const filterBtn = $("previousFilterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      previousLowOnly = !previousLowOnly;
      renderCategories();
    });
  }

  const todayBtn = $("todayInventoryBtn");
  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      activeTab = "inventory";
      previousLowOnly = false;
      render();
    });
  }
}

function selectItem(id) {
  selectedId = id;
  const item = inventory.find(i => i.id === id);
  if (!item) return;
  selectedCategoryId = item.categoryId;
  keypadValue = String(item.stock);
  outOfStockPending = Boolean(item.outOfStock && Number(item.stock) === 0);
  render();
}

function showEmpty() {
  $("selectedEmpty").classList.remove("hidden");
  $("editor").classList.add("hidden");
}

function updateEditor(item) {
  $("selectedEmpty").classList.add("hidden");
  $("editor").classList.remove("hidden");
  $("keypadItemName").textContent = item.name;
  const showingOutOfStock = Boolean(outOfStockPending && Number(keypadValue) === 0);
  $("keypadDisplay").textContent = showingOutOfStock ? "OUT OF STOCK" : formatNumber(keypadValue || 0);
  $("keypadDisplay").classList.toggle("out-stock-display", showingOutOfStock);
}

function updateLowCount() {
  $("lowCount")?.remove();
}

function handleKey(key) {
  if (!selectedId || activeTab !== "inventory") return;

  if (key === "outOfStock") {
    keypadValue = "0";
    outOfStockPending = true;
  } else if (key === "backspace") {
    keypadValue = keypadValue.slice(0, -1);
    outOfStockPending = false;
  } else if (/^\d$/.test(key)) {
    if (keypadValue === "0") keypadValue = key;
    else if (keypadValue.length < 7) keypadValue += key;
    outOfStockPending = false;
  }

  const showingOutOfStock = Boolean(outOfStockPending && Number(keypadValue) === 0);
  $("keypadDisplay").textContent = showingOutOfStock ? "OUT OF STOCK" : formatNumber(keypadValue || 0);
  $("keypadDisplay").classList.toggle("out-stock-display", showingOutOfStock);
}

function saveCurrentStock() {
  if (!selectedId || activeTab !== "inventory") return;

  const value = Math.max(0, parseInt(keypadValue || "0", 10));
  const item = inventory.find(i => i.id === selectedId);
  if (!item) return;

  item.stock = value;
  item.lastInventory = new Date().toISOString();
  item.outOfStock = Boolean(outOfStockPending && value === 0);

  saveInventory();
  keypadValue = String(value);
  render();
  showToast(item.outOfStock
    ? `${item.name} marked Out of Stock.`
    : `${item.name} updated to ${formatNumber(value)} ${item.unit}`);
}

function resetData() {
  const ok = confirm("Reset all inventory counts, timestamps, and order statuses? This cannot be undone.");
  if (!ok) return;
  inventory = buildSeedInventory().map(item => ({
    ...item,
    lastInventory: null,
    orderStatus: false,
    outOfStock: false,
    supplier: normalizeSupplier(item.supplier || "")
  }));
  saveInventory();
  selectedId = null;
  selectedCategoryId = INVENTORY_SEED[0]?.id || null;
  keypadValue = "";
  outOfStockPending = false;
  render();
  showToast("Inventory reset.");
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

$("inventoryTab").addEventListener("click", () => {
  activeTab = "inventory";
  render();
});

$("lowStocksTab").addEventListener("click", () => {
  activeTab = "low";
  render();
});

$("keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) handleKey(button.dataset.key);
});

$("saveBtn").addEventListener("click", saveCurrentStock);
$("resetBtn").addEventListener("click", resetData);

$("previousInventoryBtn").addEventListener("click", () => {
  activeTab = "previous";
  previousLowOnly = false;
  render();
});

window.addEventListener("online", () => $("onlineStatus").textContent = "Online");
window.addEventListener("offline", () => $("onlineStatus").textContent = "Offline mode");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.warn));
}

ensureDailyRollover();
render();

setInterval(() => {
  const before = localStorage.getItem(DAY_KEY);
  ensureDailyRollover();
  if (before !== localStorage.getItem(DAY_KEY)) render();
}, 30000);
