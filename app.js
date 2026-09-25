const STORAGE_KEY = "kape-barrio-inventory-v1";

let inventory = loadInventory();
let selectedId = null;
let selectedCategoryId = INVENTORY_SEED[0]?.id || null;
let keypadValue = "";
let activeTab = "inventory";
let outOfStockPending = false;

const $ = (id) => document.getElementById(id);

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
              outOfStock: Boolean(existing.outOfStock)
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
          outOfStock: Boolean(item.outOfStock)
        }));

      const result = [...merged, ...legacyItems];
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
    outOfStock: false
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
  $("appShell").classList.toggle("low-mode", activeTab === "low");

  if (activeTab === "low") {
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

  const category = INVENTORY_SEED.find(c => c.id === selectedCategoryId) || INVENTORY_SEED[0];
  if (!category) return;

  const items = inventory.filter(item => item.categoryId === category.id);
  const wrapper = document.createElement("div");
  wrapper.className = "category single-category";

  items.forEach(item => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `ingredient-row ${selectedId === item.id ? "selected" : ""} ${isLow(item) ? "low" : ""}`;
    const stockLabel = item.outOfStock && isChecked(item)
      ? "OUT OF STOCK"
      : `${formatNumber(item.stock)} ${escapeHtml(item.unit)}`;

    row.innerHTML = `
      <span class="item-main"><strong>${escapeHtml(item.name)}</strong></span>
      <span class="item-stock ${item.outOfStock && isChecked(item) ? "out-stock-row-label" : ""}">
        <strong>${stockLabel}</strong>
      </span>
      ${isChecked(item) ? '<span class="ingredient-check" aria-label="Updated">✓</span>' : ''}
      ${isLow(item) && !isChecked(item) ? '<span class="warning-dot">!</span>' : ""}
    `;
    row.addEventListener("click", () => selectItem(item.id));
    wrapper.appendChild(row);
  });

  container.appendChild(wrapper);
}

function renderLowStocks(container) {
  const lowItems = inventory.filter(isLow);

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

  lowItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "low-stock-row";
    row.innerHTML = `
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(formatDateTime(item.lastInventory))}</span>
      <span class="remaining-stock">${formatNumber(item.stock)} ${escapeHtml(item.unit)}</span>
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
  if (!selectedId || activeTab === "low") return;

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
  if (!selectedId || activeTab === "low") return;

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
    outOfStock: false
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

window.addEventListener("online", () => $("onlineStatus").textContent = "Online");
window.addEventListener("offline", () => $("onlineStatus").textContent = "Offline mode");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.warn));
}

render();
