// Kape' Bar-Rio inventory seed data.
// Add future categories/items here. Existing browser data is preserved unless Reset Data is used.
const INVENTORY_SEED = [
  {
    id: "packaging",
    name: "Packaging",
    items: [
      ["12 oz Cup", "pcs", 100],
      ["16 oz Cup", "pcs", 100],
      ["22 oz Cup", "pcs", 100],
      ["Dome Lids", "pcs", 100],
      ["Flat Lids", "pcs", 100],
      ["Strawless Lids", "pcs", 100],
      ["Bobba Straws", "pcs", 100],
      ["Thin Straws", "pcs", 100],
      ["Parchment Paper", "pcs", 100],
      ["Single Bags", "pcs", 100],
      ["Double Bags", "pcs", 100],
      ["Styro for Siomai", "pcs", 20]
    ]
  },
  {
    id: "syrups",
    name: "Syrups",
    items: [
      ["Sweetener Syrup", "ml", 250],
      ["Blue Lemonade Syrup", "ml", 250],
      ["Blueberry Syrup", "ml", 250],
      ["Four Season Syrup", "ml", 250],
      ["Green Apple Syrup", "ml", 250],
      ["Caramel Syrup", "ml", 250],
      ["Brown Sugar Syrup", "ml", 250],
      ["Choco Syrup", "ml", 250],
      ["Coffee Syrup", "ml", 250],
      ["Strawberry Syrup", "ml", 250],
      ["Vanilla Syrup", "ml", 250],
      ["Blueberry Jam", "g", 250],
      ["Strawberry Jam", "g", 250],
      ["Mango Jam", "g", 250],
      ["Choco Fondue", "g", 250],
      ["Nutella", "g", 250]
    ]
  }
];

function buildSeedInventory() {
  return INVENTORY_SEED.flatMap(category =>
    category.items.map(([name, unit, threshold]) => ({
      id: `${category.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      categoryId: category.id,
      category: category.name,
      name,
      unit,
      threshold,
      stock: 0
    }))
  );
}
