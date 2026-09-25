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
      const savedById = new Map(data.map(item => [item.id, item]));
      const seed = buildSeedInventory();

      const merged = seed.map(seedItem => {
        const existing = savedById.get(seedItem.id);
        return existing
          ? {
              ...seedItem,
              ...existing,
              lastInventory: existing.lastInventory || null,
              orderStatus: Boolean(existing.orderStatus)
            }
          : { ...seedItem, lastInventory: null, orderStatus: false };
      });

      const seedIds = new Set(seed.map(item => item.id));
      const legacyItems = data
        .filter(item => !seedIds.has(item.id))
        .map(item => ({
          ...item,
          lastInventory: item.lastInventory || null,
          orderStatus: Boolean(item.orderStatus)
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
    orderStatus: false
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

function renderCategories() {
  const container = $("categoryList");
  container.innerHTML = "";

  INVENTORY_SEED.forEach(category => {
    let items = inventory.filter(item => item.categoryId === category.id);
    if (activeTab === "low") items = items.filter(isLow);
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

    if (activeTab === "low") {
      const columnHeader = document.createElement("div");
      columnHeader.className = "low-columns";
      columnHeader.innerHTML = `
        <span>Ingredient</span>
        <span>Last Inventory</span>
        <span>Remaining Stock</span>
        <span>Order Status</span>
      `;
      wrapper.appendChild(columnHeader);

      items.forEach(item => {
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
        wrapper.appendChild(row);
      });
    } else {
      items.forEach(item => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = `ingredient-row ${selectedId === item.id ? "selected" : ""} ${isLow(item) ? "low" : ""}`;
        row.innerHTML = `
          <span class="item-main">
            <strong>${escapeHtml(item.name)}</strong>
          </span>
          <span class="item-stock">
            <strong>${formatNumber(item.stock)}</strong>
            <small>${escapeHtml(item.unit)}</small>
          </span>
          ${isLow(item) ? '<span class="warning-dot">!</span>' : ""}
        `;
        row.addEventListener("click", () => selectItem(item.id));
        wrapper.appendChild(row);
      });
    }

    container.appendChild(wrapper);
  });

  if (!container.children.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = activeTab === "low"
      ? "<strong>No low-stock items.</strong><span>Everything is currently above its threshold.</span>"
      : "<strong>No ingredients.</strong><span>Add ingredients through the inventory data.</span>";
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
  $("keypadItemName").textContent = item.name;
  $("keypadDisplay").textContent = formatNumber(keypadValue || 0);
}

function updateLowCount() {
  const count = inventory.filter(isLow).length;
  $("lowCount")?.remove();
  // Low-stock count is intentionally not displayed in the simplified left panel.
}

function handleKey(key) {
  if (!selectedId || activeTab === "low") return;

  if (key === "clear") keypadValue = "";
  else if (key === "backspace") keypadValue = keypadValue.slice(0, -1);
  else if (/^\d$/.test(key)) {
    if (keypadValue === "0") keypadValue = key;
    else if (keypadValue.length < 7) keypadValue += key;
  }

  $("keypadDisplay").textContent = formatNumber(keypadValue || 0);
}

function saveCurrentStock() {
  if (!selectedId || activeTab === "low") return;

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

function resetData() {
  const ok = confirm("Reset all inventory counts, timestamps, and order statuses? This cannot be undone.");
  if (!ok) return;
  inventory = buildSeedInventory().map(item => ({
    ...item,
    lastInventory: null,
    orderStatus: false
  }));
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
