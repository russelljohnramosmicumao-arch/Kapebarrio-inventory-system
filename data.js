// Kape' Bar-Rio inventory seed data.
// Thresholds are initial/provisional values and can be changed here later.
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
  },
  {
    id: "powders-coffee-beans",
    name: "Powders and Coffee Beans",
    items: [
      ["Milk essence", "g", 250],
      ["Matcha Powder", "g", 250],
      ["Matcha Powder (Premium)", "g", 250],
      ["Taro Powder", "g", 250],
      ["Winter Melon Powder", "g", 250],
      ["Black Forest Powder", "g", 250],
      ["Cookies and Cream Powder", "g", 250],
      ["Okinawa Powder", "g", 250],
      ["Coffee Beans", "g", 250]
    ]
  },
  {
    id: "carton-soda-cans-sinkers",
    name: "Carton, Soda, Cans, Sinkers",
    items: [
      ["Condensed Milk", "g", 250],
      ["Chuckie Small", "pcs", 10],
      ["Chuckie Big", "pcs", 10],
      ["Dutchmill Small", "pcs", 10],
      ["Dutchmill Big", "pcs", 10],
      ["Coke Soda", "pcs", 10],
      ["Sprite Soda", "pcs", 10],
      ["Fresh Milk", "ml", 1000],
      ["Bobba Pearl", "g", 250],
      ["Rainbow Jelly", "g", 250]
    ]
  },
  {
    id: "sanitation-miscellaneous",
    name: "Sanitation and Miscellaneous",
    items: [
      ["Alcohol", "ml", 500],
      ["Paper Towels", "pcs", 10],
      ["Gloves", "pcs", 10],
      ["Dishwashing Liquid", "ml", 500],
      ["Sponge", "pcs", 5],
      ["Brush", "pcs", 2],
      ["Water", "ml", 1000]
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
