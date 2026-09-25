// Kape' Bar-Rio inventory seed data.
// Thresholds are initial/provisional values and can be changed here later.
const INVENTORY_SEED = [
  {
    id: "packaging",
    name: "Packaging",
    items: [
      ["12 oz Cup", "pcs", 100, "InkShop Supplier"],
      ["16 oz Cup", "pcs", 100, "InkShop Supplier"],
      ["22 oz Cup", "pcs", 100, "InkShop Supplier"],
      ["Dome Lids", "pcs", 100, "InkShop Supplier"],
      ["Flat Lids", "pcs", 100, "InkShop Supplier"],
      ["Strawless Lids", "pcs", 100, "InkShop Supplier"],
      ["Bobba Straws", "pcs", 100, "InkShop Supplier"],
      ["Thin Straws", "pcs", 100, "InkShop Supplier"],
      ["Parchment Paper", "pcs", 100, "Tiktok Shop"],
      ["Single Bags", "pcs", 100, "InkShop Supplier"],
      ["Double Bags", "pcs", 100, "InkShop Supplier"],
      ["Styro for Siomai", "pcs", 20, "Grocery"],
    ]
  },
  {
    id: "syrups",
    name: "Syrups",
    items: [
      ["Sweetener Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Blue Lemonade Syrup", "ml", 250, "InJoy Supplier"],
      ["Blueberry Syrup", "ml", 250, "InJoy Supplier"],
      ["Four Season Syrup", "ml", 250, "InJoy Supplier"],
      ["Green Apple Syrup", "ml", 250, "InJoy Supplier"],
      ["Caramel Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Brown Sugar Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Choco Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Coffee Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Strawberry Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Vanilla Syrup", "ml", 250, "EasyBrand Supplier"],
      ["Blueberry Jam", "g", 250, "Tiktok (DokiJam)"],
      ["Strawberry Jam", "g", 250, "Tiktok (DokiJam)"],
      ["Mango Jam", "g", 250, "Tiktok (DokiJam)"],
      ["Choco Fondue", "g", 250, "InJoy Supplier"],
      ["Nutella", "g", 250, "Tiktok or CSI"],
    ]
  },
  {
    id: "powders-coffee-beans",
    name: "Powders and Coffee Beans",
    items: [
      ["Milk essence", "g", 250, "EasyBrand Supplier"],
      ["Matcha Powder", "g", 250, "EasyBrand Supplier"],
      ["Matcha Powder (Premium)", "g", 250, "Tiktok"],
      ["Taro Powder", "g", 250, "InJoy Supplier"],
      ["Winter Melon Powder", "g", 250, "InJoy Supplier"],
      ["Black Forest Powder", "g", 250, "InJoy Supplier"],
      ["Cookies and Cream Powder", "g", 250, "Lazada (c/o kuya John)"],
      ["Okinawa Powder", "g", 250, "InJoy Supplier"],
      ["Coffee Beans", "g", 250, "Tiktok (Joseph)"],
    ]
  },
  {
    id: "carton-soda-cans-sinkers",
    name: "Carton, Soda, Cans, Sinkers",
    items: [
      ["Condensed Milk", "g", 250, "Grocery"],
      ["Chuckie Small", "pcs", 10, "Grocery"],
      ["Chuckie Big", "pcs", 10, "Grocery"],
      ["Dutchmill Small", "pcs", 10, "Grocery"],
      ["Dutchmill Big", "pcs", 10, "Grocery"],
      ["Coke Soda", "pcs", 10, "Grocery"],
      ["Sprite Soda", "pcs", 10, "Grocery"],
      ["Fresh Milk", "ml", 1000, "Grocery"],
      ["Bobba Pearl", "g", 250, "InJoy Supplier"],
      ["Rainbow Jelly", "g", 250, "Grocery"],
    ]
  },
  {
    id: "sanitation-miscellaneous",
    name: "Sanitation and Miscellaneous",
    items: [
      ["Alcohol", "ml", 500, "Grocery"],
      ["Paper Towels", "pcs", 10, "Grocery"],
      ["Gloves", "pcs", 10, "Tiktok"],
      ["Dishwashing Liquid", "ml", 500, "Grocery"],
      ["Sponge", "pcs", 5, "Grocery"],
      ["Brush", "pcs", 2, "Grocery"],
      ["Water", "ml", 1000, "PaOrder"],
    ]
  }
];

function buildSeedInventory() {
  return INVENTORY_SEED.flatMap(category =>
    category.items.map(([name, unit, threshold, supplier]) => ({
      id: `${category.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      categoryId: category.id,
      category: category.name,
      name,
      unit,
      threshold,
      stock: 0,
      supplier: supplier || ""
    }))
  );
}
