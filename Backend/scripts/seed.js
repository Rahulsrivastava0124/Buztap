/**
 * Seed script — populates MongoDB with one business, 3 users, 24 menu items,
 * 20 tables, 4 inventory items, 3 payment channels, and sample orders.
 *
 * Run: npm run seed
 * CAUTION: drops existing data for the seeded business before inserting.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Business = require("../src/models/Business");
const User = require("../src/models/User");
const MenuItem = require("../src/models/MenuItem");
const Table = require("../src/models/Table");
const Inventory = require("../src/models/Inventory");
const Order = require("../src/models/Order");
const PaymentChannel = require("../src/models/PaymentChannel");

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/tableqr",
  );
  console.log("Connected to MongoDB");

  // ── Business ──────────────────────────────────────────────────────────────
  let business = await Business.findOne({ subdomain: "spice-garden" });
  if (!business) {
    business = await Business.create({
      name: "Spice Garden",
      type: "restro",
      email: "owner@spicegarden.com",
      phone: "+91-9876543210",
      address: "Pune, Maharashtra",
      plan: "pro",
      subdomain: "spice-garden",
    });
    console.log("Business created:", business._id);
  } else {
    console.log("Business already exists:", business._id);
  }

  const bizId = business._id;

  // Clean existing data for this business before re-seeding
  await Promise.all([
    User.deleteMany({ businessId: bizId }),
    MenuItem.deleteMany({ businessId: bizId }),
    Table.deleteMany({ businessId: bizId }),
    Inventory.deleteMany({ businessId: bizId }),
    Order.deleteMany({ businessId: bizId }),
    PaymentChannel.deleteMany({ businessId: bizId }),
  ]);

  // ── Users ─────────────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 10);
  await User.insertMany([
    {
      businessId: bizId,
      username: "admin",
      passwordHash: await hash("admin123"),
      role: "admin",
      name: "Rahul (Admin)",
      shift: "Morning",
      serviceScore: 99,
    },
    {
      businessId: bizId,
      username: "manager",
      passwordHash: await hash("manager123"),
      role: "manager",
      name: "Priya (Manager)",
      shift: "Morning",
      serviceScore: 92,
    },
    {
      businessId: bizId,
      username: "cashier",
      passwordHash: await hash("cashier123"),
      role: "cashier",
      name: "Aman (Cashier)",
      shift: "Evening",
      serviceScore: 85,
    },
  ]);
  console.log("Users created (admin / manager / cashier)");

  // ── Menu Items ─────────────────────────────────────────────────────────────
  const menuItems = [
    // Starters
    {
      name: "Paneer Tikka",
      category: "Starters",
      price: 220,
      cost: 70,
      isVeg: true,
      spiceLevel: 3,
      preparationTime: 15,
      image:
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
    },
    {
      name: "Veg Spring Rolls",
      category: "Starters",
      price: 160,
      cost: 45,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 10,
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    },
    {
      name: "Chicken 65",
      category: "Starters",
      price: 280,
      cost: 90,
      isVeg: false,
      spiceLevel: 4,
      preparationTime: 18,
      image:
        "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400",
    },
    {
      name: "Samosa (2 pcs)",
      category: "Starters",
      price: 80,
      cost: 20,
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 8,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    },
    // Mains
    {
      name: "Paneer Butter Masala",
      category: "Mains",
      price: 280,
      cost: 95,
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 20,
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    },
    {
      name: "Dal Makhani",
      category: "Mains",
      price: 220,
      cost: 60,
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 25,
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
    },
    {
      name: "Butter Chicken",
      category: "Mains",
      price: 320,
      cost: 110,
      isVeg: false,
      spiceLevel: 2,
      preparationTime: 22,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
    },
    {
      name: "Chicken Biryani",
      category: "Mains",
      price: 340,
      cost: 120,
      isVeg: false,
      spiceLevel: 3,
      preparationTime: 30,
      image:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    },
    {
      name: "Veg Biryani",
      category: "Mains",
      price: 260,
      cost: 80,
      isVeg: true,
      spiceLevel: 2,
      preparationTime: 28,
      image:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    },
    {
      name: "Shahi Paneer",
      category: "Mains",
      price: 300,
      cost: 100,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 20,
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    },
    {
      name: "Mutton Rogan Josh",
      category: "Mains",
      price: 420,
      cost: 180,
      isVeg: false,
      spiceLevel: 4,
      preparationTime: 35,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
    },
    {
      name: "Kadai Chicken",
      category: "Mains",
      price: 360,
      cost: 130,
      isVeg: false,
      spiceLevel: 3,
      preparationTime: 25,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
    },
    // Breads
    {
      name: "Butter Naan",
      category: "Breads",
      price: 50,
      cost: 12,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 8,
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    },
    {
      name: "Garlic Naan",
      category: "Breads",
      price: 70,
      cost: 18,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 8,
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    },
    {
      name: "Paratha",
      category: "Breads",
      price: 60,
      cost: 15,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 10,
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    },
    {
      name: "Tandoori Roti",
      category: "Breads",
      price: 40,
      cost: 8,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 6,
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    },
    // Rice
    {
      name: "Steamed Rice",
      category: "Rice",
      price: 100,
      cost: 20,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 15,
      image:
        "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400",
    },
    {
      name: "Jeera Rice",
      category: "Rice",
      price: 140,
      cost: 30,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 18,
      image:
        "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400",
    },
    // Beverages
    {
      name: "Masala Chai",
      category: "Beverages",
      price: 60,
      cost: 15,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 5,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
    {
      name: "Mango Lassi",
      category: "Beverages",
      price: 120,
      cost: 30,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 5,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
    {
      name: "Fresh Lime Soda",
      category: "Beverages",
      price: 80,
      cost: 20,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 3,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
    {
      name: "Cold Coffee",
      category: "Beverages",
      price: 140,
      cost: 35,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 5,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
    // Desserts
    {
      name: "Gulab Jamun (2 pcs)",
      category: "Desserts",
      price: 100,
      cost: 25,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 5,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
    {
      name: "Kulfi",
      category: "Desserts",
      price: 120,
      cost: 30,
      isVeg: true,
      spiceLevel: 1,
      preparationTime: 3,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
  ];

  const insertedItems = await MenuItem.insertMany(
    menuItems.map((m) => ({ ...m, businessId: bizId })),
  );
  console.log(`Menu: ${insertedItems.length} items created`);

  // ── Tables ────────────────────────────────────────────────────────────────
  const areas = ["Ground Floor", "First Floor", "Patio"];
  const seatsConfig = [
    2, 2, 4, 4, 4, 6, 2, 4, 4, 6, 2, 4, 4, 6, 2, 4, 4, 2, 6, 4,
  ];
  const tableStatuses = [
    "Free",
    "Occupied",
    "Reserved",
    "Free",
    "Occupied",
    "Free",
    "Cleaning",
    "Occupied",
    "Free",
    "Free",
    "Occupied",
    "Free",
    "Reserved",
    "Free",
    "Occupied",
    "Free",
    "Free",
    "Occupied",
    "Free",
    "Free",
  ];

  const tables = Array.from({ length: 20 }, (_, i) => ({
    businessId: bizId,
    tableId: `T-${String(i + 1).padStart(2, "0")}`,
    seats: seatsConfig[i],
    area: areas[i % areas.length],
    status: tableStatuses[i],
    guestName: tableStatuses[i] === "Occupied" ? `Guest ${i + 1}` : null,
    qrCode: `spice-garden-T${String(i + 1).padStart(2, "0")}`,
  }));

  await Table.insertMany(tables);
  console.log("Tables: 20 created");

  // ── Inventory ─────────────────────────────────────────────────────────────
  await Inventory.insertMany([
    {
      businessId: bizId,
      itemName: "Paneer",
      unit: "kg",
      inStock: 18,
      reorderAt: 8,
      supplier: "Rajesh Dairy",
      costPerUnit: 250,
    },
    {
      businessId: bizId,
      itemName: "Chicken",
      unit: "kg",
      inStock: 12,
      reorderAt: 10,
      supplier: "Fresh Farms",
      costPerUnit: 200,
    },
    {
      businessId: bizId,
      itemName: "Basmati Rice",
      unit: "kg",
      inStock: 45,
      reorderAt: 15,
      supplier: "Grain Store",
      costPerUnit: 80,
    },
    {
      businessId: bizId,
      itemName: "Cooking Oil",
      unit: "liters",
      inStock: 6,
      reorderAt: 5,
      supplier: "Oil Depot",
      costPerUnit: 130,
    },
  ]);
  console.log("Inventory: 4 items created");

  // ── Payment Channels ──────────────────────────────────────────────────────
  await PaymentChannel.insertMany([
    {
      businessId: bizId,
      channel: "Razorpay UPI",
      gross: 14850,
      fee: 223,
      net: 14627,
      settleStatus: "Settled",
      isEnabled: true,
    },
    {
      businessId: bizId,
      channel: "Card Terminal",
      gross: 17600,
      fee: 352,
      net: 17248,
      settleStatus: "Pending",
      isEnabled: true,
    },
    {
      businessId: bizId,
      channel: "Cash",
      gross: 11750,
      fee: 0,
      net: 11750,
      settleStatus: "Settled",
      isEnabled: true,
    },
  ]);
  console.log("Payment channels: 3 created");

  // ── Sample Orders ─────────────────────────────────────────────────────────
  const pb = insertedItems[4]; // Paneer Butter Masala
  const gn = insertedItems[13]; // Garlic Naan
  const bc = insertedItems[6]; // Butter Chicken
  const sr = insertedItems[17]; // Jeera Rice
  const dm = insertedItems[5]; // Dal Makhani
  const cl = insertedItems[20]; // Fresh Lime Soda

  await Order.insertMany([
    {
      businessId: bizId,
      orderId: "#2849",
      tableId: "T-04",
      guestName: "Guest 1",
      orderType: "Dine-in",
      source: "POS",
      items: [
        {
          menuItemId: pb._id,
          name: pb.name,
          quantity: 1,
          price: pb.price,
          total: pb.price,
          preparationStatus: "Served",
        },
        {
          menuItemId: gn._id,
          name: gn.name,
          quantity: 2,
          price: gn.price,
          total: gn.price * 2,
          preparationStatus: "Served",
        },
      ],
      subtotal: 420,
      discount: 0,
      discountPct: 0,
      taxableAmount: 420,
      tax: 21,
      total: 441,
      paymentMethod: "Card/UPI",
      paymentStatus: "Completed",
      status: "Served",
      kitchenTicketId: "#K-2849",
    },
    {
      businessId: bizId,
      orderId: "#2850",
      tableId: "T-07",
      guestName: "Guest 2",
      orderType: "Dine-in",
      source: "QR",
      items: [
        {
          menuItemId: bc._id,
          name: bc.name,
          quantity: 1,
          price: bc.price,
          total: bc.price,
          preparationStatus: "Preparing",
        },
        {
          menuItemId: sr._id,
          name: sr.name,
          quantity: 1,
          price: sr.price,
          total: sr.price,
          preparationStatus: "Preparing",
        },
      ],
      subtotal: 480,
      discount: 0,
      discountPct: 0,
      taxableAmount: 480,
      tax: 24,
      total: 504,
      paymentMethod: "Pending",
      paymentStatus: "Pending",
      status: "Preparing",
      kitchenTicketId: "#K-2850",
    },
    {
      businessId: bizId,
      orderId: "#2851",
      tableId: "T-11",
      guestName: "Guest 3",
      orderType: "Dine-in",
      source: "POS",
      items: [
        {
          menuItemId: dm._id,
          name: dm.name,
          quantity: 1,
          price: dm.price,
          total: dm.price,
          preparationStatus: "Ready",
        },
        {
          menuItemId: gn._id,
          name: gn.name,
          quantity: 1,
          price: gn.price,
          total: gn.price,
          preparationStatus: "Ready",
        },
      ],
      subtotal: 290,
      discount: 0,
      discountPct: 0,
      taxableAmount: 290,
      tax: 15,
      total: 305,
      paymentMethod: "Cash",
      paymentStatus: "Completed",
      status: "Ready",
      kitchenTicketId: "#K-2851",
    },
    {
      businessId: bizId,
      orderId: "#2852",
      tableId: "T-15",
      guestName: "Guest 4",
      orderType: "Dine-in",
      source: "QR",
      items: [
        {
          menuItemId: pb._id,
          name: pb.name,
          quantity: 2,
          price: pb.price,
          total: pb.price * 2,
          preparationStatus: "Preparing",
        },
        {
          menuItemId: cl._id,
          name: cl.name,
          quantity: 2,
          price: cl.price,
          total: cl.price * 2,
          preparationStatus: "Preparing",
        },
      ],
      subtotal: 720,
      discount: 36,
      discountPct: 5,
      taxableAmount: 684,
      tax: 34,
      total: 718,
      paymentMethod: "Pending",
      paymentStatus: "Pending",
      status: "Preparing",
      kitchenTicketId: "#K-2852",
    },
    {
      businessId: bizId,
      orderId: "#2853",
      roomId: "216",
      guestName: "Room Guest",
      orderType: "Room Service",
      source: "QR",
      items: [
        {
          menuItemId: bc._id,
          name: bc.name,
          quantity: 1,
          price: bc.price,
          total: bc.price,
          preparationStatus: "Served",
        },
      ],
      subtotal: 320,
      discount: 0,
      discountPct: 0,
      taxableAmount: 320,
      tax: 16,
      total: 336,
      paymentMethod: "Room Charge",
      paymentStatus: "Completed",
      status: "Served",
      kitchenTicketId: "#K-2853",
    },
  ]);
  console.log("Sample orders: 5 created");

  console.log("\n✓ Seed complete!");
  console.log("  Admin login:   username=admin   password=admin123");
  console.log("  Manager login: username=manager password=manager123");
  console.log("  Cashier login: username=cashier password=cashier123");
  console.log(`  Business ID:   ${bizId}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
