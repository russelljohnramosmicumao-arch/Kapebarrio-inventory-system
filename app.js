const STORAGE_KEY = "kape-barrio-inventory-v1";

let inventory = loadInventory();
let selectedId = null;
let keypadValue = "";
let activeTab = "inventory";

const $ = (id) => document.getElementById(id);

function loadInventory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return data.map(item => ({
        ...item,
        lastInventory: item.lastInventory || null
      }));
    }
  } catch (e) {
    console.warn("Could not read saved inventory.", e);
  }
  const fresh = buildSeedInventory().map(item => ({ ...item, lastInventory: null }));
  saveInventory(fresh);
  return fresh;
}

function saveInventory(data = inventory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isLow(item) {
  return Number(item.stock) <= Number(item.threshold);
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
  renderCategories();
  updateLowCount();

  $("inventoryTab").classList.toggle("active", activeTab === "inventory");
  $("lowStocksTab").classList.toggle("active", activeTab === "low");

  if (selectedId) {
    const selected = inventory.find(i => i.id === selectedId);
    if (selected) updateEditor(selected);
    else showEmpty();
  } else {
    showEmpty();
  }
}

function renderCategories() {
  const container = $("categoryList");
  const query = $("searchInput").value.trim().toLowerCase();
  container.innerHTML = "";

  INVENTORY_SEED.forEach(category => {
    let items = inventory.filter(item =>
      item.categoryId === category.id &&
      (!query || item.name.toLowerCase().includes(query))
    );

    if (activeTab === "low") {
      items = items.filter(isLow);
    }

    if (!items.length) return;

    const low = items.filter(isLow).length;
    const wrapper = document.createElement("div");
    wrapper.className = "category";

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
      <div class="category-title">
        <strong>${escapeHtml(category.name)}</strong>
        <span>${items.length} ${items.length === 1 ? "item" : "items"}</span>
      </div>
      ${low ? `<span class="category-low">${low} low</span>` : ""}
    `;
    wrapper.appendChild(header);

    items.forEach(item => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = `ingredient-row ${selectedId === item.id ? "selected" : ""} ${isLow(item) ? "low" : ""}`;

      const orderStatus = isLow(item) ? "Needs Ordering" : "OK";

      row.innerHTML = `
        <span class="item-main">
          <strong>${escapeHtml(item.name)}</strong>
          <small>Low stock: ${formatNumber(item.threshold)} ${item.unit}</small>
        </span>
        <span class="item-stock">
          <strong>${formatNumber(item.stock)}</strong>
          <small>${item.unit}</small>
        </span>
        ${isLow(item) ? '<span class="warning-dot">!</span>' : ""}
      `;

      if (activeTab === "low") {
        const meta = document.createElement("div");
        meta.className = "low-meta";
        meta.innerHTML = `
          <span>Last inventory: <strong>${escapeHtml(formatDateTime(item.lastInventory))}</strong></span>
          <span class="order-status ${isLow(item) ? "needs-order" : "ordered"}">${orderStatus}</span>
        `;
        wrapper.appendChild(row);
        wrapper.appendChild(meta);
      } else {
        wrapper.appendChild(row);
      }

      row.addEventListener("click", () => selectItem(item.id));
    });

    container.appendChild(wrapper);
  });

  if (!container.children.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = activeTab === "low"
      ? "<strong>No low-stock items.</strong><span>Everything is currently above its threshold.</span>"
      : "<strong>No ingredients found.</strong><span>Try a different search.</span>";
    container.appendChild(empty);
  }
}

function selectItem(id) {
  selectedId = id;
  const item = inventory.find(i => i.id === id);
  keypadValue = String(item.stock);
  render();
}

function showEmpty() {
  $("selectedEmpty").classList.remove("hidden");
  $("editor").classList.add("hidden");
}

function updateEditor(item) {
  $("selectedEmpty").classList.add("hidden");
  $("editor").classList.remove("hidden");

  $("selectedCategory").textContent = item.category;
  $("selectedName").textContent = item.name;
  $("displayValue").textContent = formatNumber(item.stock);
  $("displayUnit").textContent = item.unit;
  $("keypadDisplay").textContent = keypadValue || "0";

  const status = $("stockStatus");
  status.textContent = isLow(item)
    ? `LOW STOCK · threshold ${formatNumber(item.threshold)} ${item.unit}`
    : "NORMAL STOCK";
  status.className = `stock-status ${isLow(item) ? "low" : "normal"}`;
}

function updateLowCount() {
  const count = inventory.filter(isLow).length;
  $("lowCount").textContent = `${count} low stock`;
}

function handleKey(key) {
  if (!selectedId) return;

  if (key === "clear") {
    keypadValue = "";
  } else if (key === "backspace") {
    keypadValue = keypadValue.slice(0, -1);
  } else if (/^\d$/.test(key)) {
    if (keypadValue === "0") keypadValue = key;
    else if (keypadValue.length < 7) keypadValue += key;
  }

  $("keypadDisplay").textContent = keypadValue || "0";
}

function saveCurrentStock() {
  if (!selectedId) return;

  const value = Math.max(0, parseInt(keypadValue || "0", 10));
  const item = inventory.find(i => i.id === selectedId);
  if (!item) return;

  item.stock = value;
  item.lastInventory = new Date().toISOString();

  saveInventory();
  keypadValue = String(value);
  render();
  showToast(`${item.name} updated to ${formatNumber(value)} ${item.unit}`);
}

function adjustStock(amount) {
  if (!selectedId) return;
  const item = inventory.find(i => i.id === selectedId);
  const current = Number(keypadValue || item.stock || 0);
  keypadValue = String(Math.max(0, current + amount));
  $("keypadDisplay").textContent = formatNumber(keypadValue);
}

function resetData() {
  const ok = confirm("Reset all inventory counts and inventory timestamps to 0? This cannot be undone.");
  if (!ok) return;
  inventory = buildSeedInventory().map(item => ({ ...item, lastInventory: null }));
  saveInventory();
  selectedId = null;
  keypadValue = "";
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

$("searchInput").addEventListener("input", renderCategories);

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

document.querySelectorAll("[data-adjust]").forEach(button => {
  button.addEventListener("click", () => adjustStock(Number(button.dataset.adjust)));
});

$("saveBtn").addEventListener("click", saveCurrentStock);
$("resetBtn").addEventListener("click", resetData);

window.addEventListener("online", () => $("onlineStatus").textContent = "Online");
window.addEventListener("offline", () => $("onlineStatus").textContent = "Offline mode");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.warn));
}

render();
