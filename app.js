const STORAGE_KEY = "kape-barrio-inventory-v1";

let inventory = loadInventory();
let selectedId = null;
let keypadValue = "";

const $ = (id) => document.getElementById(id);

function loadInventory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Could not read saved inventory.", e);
  }
  const fresh = buildSeedInventory();
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

function render() {
  renderCategories();
  updateLowCount();

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
    const items = inventory.filter(item =>
      item.categoryId === category.id &&
      (!query || item.name.toLowerCase().includes(query))
    );

    if (!items.length) return;

    const low = items.filter(isLow).length;
    const wrapper = document.createElement("div");
    wrapper.className = "category";

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
      <div>
        <strong>${escapeHtml(category.name)}</strong>
        <span>${items.length} items</span>
      </div>
      ${low ? `<span class="category-low">${low} low</span>` : ""}
    `;
    wrapper.appendChild(header);

    items.forEach(item => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = `ingredient-row ${selectedId === item.id ? "selected" : ""} ${isLow(item) ? "low" : ""}`;
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
      row.addEventListener("click", () => selectItem(item.id));
      wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
  });
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
  const ok = confirm("Reset all inventory counts to 0? This cannot be undone.");
  if (!ok) return;
  inventory = buildSeedInventory();
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
