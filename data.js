// Kape' Bar-Rio inventory seed data.
// threshold is stored in the item's base measurement unit.
// measurement describes how baristas enter whole containers/packs plus a remainder.
const INVENTORY_SEED = [
  {
    id: "packaging",
    name: "Packaging",
    items: [
      ["12 oz Cup", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 50 }] ,
      ["16 oz Cup", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 50 }] ,
      ["22 oz Cup", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 50 }] ,
      ["Dome Lids", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 50 }] ,
      ["Flat Lids", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 50 }] ,
      ["Strawless Lids", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 50 }] ,
      ["Bobba Straws", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 100 }] ,
      ["Thin Straws", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 100 }] ,
      ["Parchment Paper", "pcs", 100, "Tiktok Shop", { type: "packaging", label: "Pack", size: 50 }] ,
      ["Single Bags", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 100 }] ,
      ["Double Bags", "pcs", 100, "InkShop Supplier", { type: "packaging", label: "Pack", size: 100 }] ,
      ["Styro for Siomai", "pcs", 10, "Grocery"],
    ]
  },
  {
    id: "syrups",
    name: "Syrups",
    items: [
      ["Sweetener Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Blue Lemonade Syrup", "ml", 500, "InJoy Supplier", { type: "container", label: "Container", size: 1000 }],
      ["Blueberry Syrup", "ml", 500, "InJoy Supplier", { type: "container", label: "Container", size: 1000 }],
      ["Four Season Syrup", "ml", 500, "InJoy Supplier", { type: "container", label: "Container", size: 1000 }],
      ["Green Apple Syrup", "ml", 500, "InJoy Supplier", { type: "container", label: "Container", size: 1000 }],
      ["Caramel Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Brown Sugar Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Choco Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Coffee Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Strawberry Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Vanilla Syrup", "ml", 500, "EasyBrand Supplier", { type: "container", label: "Container", size: 2500 }],
      ["Blueberry Jam", "ml", 500, "Tiktok Shop"],
      ["Strawberry Jam", "ml", 500, "Tiktok Shop"],
      ["Mango Jam", "ml", 500, "Tiktok Shop"],
      ["Choco Fondue", "ml", 200, "InJoy Supplier"],
      ["Nutella", "ml", 10, "Tiktok Shop"],
    ]
  },
  {
    id: "powders-coffee-beans",
    name: "Powders and Coffee Beans",
    items: [
      ["Milk essence", "g", 3000, "EasyBrand Supplier", { type: "container", label: "Pack", size: 1000 }],
      ["Matcha Powder", "g", 3000, "EasyBrand Supplier", { type: "container", label: "Pack", size: 1000 }],
      ["Matcha Powder (Premium)", "g", 100, "Tiktok Shop"],
      ["Taro Powder", "g", 1000, "InJoy Supplier", { type: "container", label: "Pack", size: 500 }],
      ["White Bunny Powder", "g", 500, "", { type: "container", label: "Pack", size: 500 }],
      ["Avocado Powder", "g", 1000, "", { type: "container", label: "Pack", size: 1000 }],
      ["Winter Melon Powder", "g", 1000, "InJoy Supplier", { type: "container", label: "Pack", size: 500 }],
      ["Black Forest Powder", "g", 500, "InJoy Supplier", { type: "container", label: "Pack", size: 500 }],
      ["Cookies and Cream Powder", "g", 1000, "Lazada (c/o kuya John)", { type: "container", label: "Pack", size: 1000 }],
      ["Okinawa Powder", "g", 500, "InJoy Supplier", { type: "container", label: "Pack", size: 500 }],
      ["Coffee Beans", "g", 250, "Tiktok Shop"],
    ]
  },
  {
    id: "carton-soda-cans-sinkers",
    name: "Carton, Soda, Cans, Sinkers",
    items: [
      ["Condensed Milk", "g", 2000, "Grocery", { type: "container", label: "Can", size: 1000 }],
      ["Chuckie Small", "pcs", 2, "Grocery"],
      ["Chuckie Big", "pcs", 2, "Grocery"],
      ["Dutchmill Small", "pcs", 2, "Grocery"],
      ["Dutchmill Big", "pcs", 2, "Grocery"],
      ["Coke Soda", "ml", 1000, "Grocery", { type: "container", label: "Bottle", size: 1500 }],
      ["Sprite Soda", "ml", 1000, "Grocery", { type: "container", label: "Bottle", size: 1500 }],
      ["Fresh Milk", "ml", 1000, "Grocery", { type: "container", label: "Carton", size: 1000 }],
      ["Bobba Pearl", "g", 500, "InJoy Supplier", { type: "container", label: "Pack", size: 1000 }],
      ["Rainbow Jelly", "g", 500, "Grocery"],
    ]
  },
  {
    id: "sanitation-miscellaneous",
    name: "Sanitation and Miscellaneous",
    items: [
      ["Alcohol", "bottle", 1, "Grocery"],
      ["Paper Towels", "pcs", 1, "Grocery"],
      ["Gloves", "pcs", 50, "Tiktok Shop"],
      ["Dishwashing Liquid", "bottle", 1, "Grocery"],
      ["Sponge", "pcs", 1, "Grocery"],
      ["Brush", "pcs", 0, "Grocery"],
      ["Water", "container", 1, "PaOrder"],
    ]
  }
];

function buildSeedInventory() {
  return INVENTORY_SEED.flatMap(category =>
    category.items.map(([name, unit, threshold, supplier, measurement]) => ({
      id: `${category.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      categoryId: category.id,
      category: category.name,
      name,
      unit,
      threshold,
      stock: 0,
      supplier: supplier || "",
      measurement: measurement || null
    }))
  );
}
