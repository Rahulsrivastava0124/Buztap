export type UserRole = "admin" | "manager" | "cashier";

export type PaymentMethod = "Cash" | "Card/UPI" | "Room Charge";

export interface DashboardSnapshot {
  paymentBreakup: Array<{ label: string; amount: number; share: number }>;
  settlements: Array<{
    channel: string;
    gross: number;
    fee: number;
    net: number;
    status: "Settled" | "Pending";
  }>;
  productMix: Array<{
    name: string;
    category: string;
    units: number;
    revenue: number;
    margin: number;
    stock: "Healthy" | "Low";
  }>;
  areaLoad: Array<{
    area: string;
    occupied: number;
    total: number;
    avgTurn: number;
  }>;
  kitchenQueue: Array<{
    ticket: string;
    stage: string;
    wait: string;
    priority: "Normal" | "High";
  }>;
  channelSplit: Array<{ channel: string; value: number }>;
}

export interface PosMenuItem {
  id: number;
  name: string;
  price: number;
  cat: string;
  img: string;
}

export interface TableRecord {
  id: string;
  seats: number;
  status: "Occupied" | "Free" | "Reserved" | "Cleaning";
  guestName: string | null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DASHBOARD: DashboardSnapshot = {
  paymentBreakup: [
    { label: "Card & UPI", amount: 32450, share: 75 },
    { label: "Cash", amount: 10400, share: 24 },
    { label: "Room Charge", amount: 1350, share: 1 },
  ],
  settlements: [
    {
      channel: "Razorpay UPI",
      gross: 14850,
      fee: 223,
      net: 14627,
      status: "Settled",
    },
    {
      channel: "Card Terminal",
      gross: 17600,
      fee: 317,
      net: 17283,
      status: "Pending",
    },
    { channel: "Wallet", gross: 4800, fee: 96, net: 4704, status: "Settled" },
  ],
  productMix: [
    {
      name: "Paneer Butter Masala",
      category: "Mains",
      units: 145,
      revenue: 40600,
      margin: 34,
      stock: "Healthy",
    },
    {
      name: "Garlic Naan",
      category: "Breads",
      units: 420,
      revenue: 25200,
      margin: 42,
      stock: "Healthy",
    },
    {
      name: "Chicken Tikka",
      category: "Starters",
      units: 98,
      revenue: 31360,
      margin: 28,
      stock: "Low",
    },
    {
      name: "Mango Lassi",
      category: "Beverage",
      units: 110,
      revenue: 13200,
      margin: 48,
      stock: "Healthy",
    },
  ],
  areaLoad: [
    { area: "Ground Floor", occupied: 9, total: 12, avgTurn: 42 },
    { area: "First Floor", occupied: 6, total: 8, avgTurn: 47 },
    { area: "Patio", occupied: 2, total: 4, avgTurn: 38 },
  ],
  kitchenQueue: [
    { ticket: "#K-2849", stage: "Prep", wait: "4m", priority: "Normal" },
    { ticket: "#K-2850", stage: "Cook", wait: "11m", priority: "High" },
    { ticket: "#K-2851", stage: "Plating", wait: "2m", priority: "Normal" },
  ],
  channelSplit: [
    { channel: "POS Walk-in", value: 48 },
    { channel: "QR Dine-in", value: 37 },
    { channel: "QR Room", value: 15 },
  ],
};

const POS_MENU: PosMenuItem[] = [
  {
    id: 1,
    name: "Paneer Butter Masala",
    price: 280,
    cat: "Mains",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a695?w=300&q=70",
  },
  {
    id: 2,
    name: "Garlic Naan",
    price: 60,
    cat: "Breads",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=70",
  },
  {
    id: 3,
    name: "Dal Makhani",
    price: 220,
    cat: "Mains",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=70",
  },
  {
    id: 4,
    name: "Chicken Tikka",
    price: 320,
    cat: "Starters",
    img: "https://images.unsplash.com/photo-1599487405613-2b63b2f1aa0c?w=300&q=70",
  },
  {
    id: 5,
    name: "Mango Lassi",
    price: 120,
    cat: "Beverages",
    img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=70",
  },
];

let TABLES: TableRecord[] = Array.from({ length: 20 }).map((_, i) => {
  const n = i + 1;
  const statuses: TableRecord["status"][] = [
    "Occupied",
    "Free",
    "Reserved",
    "Cleaning",
  ];
  return {
    id: `T-${String(n).padStart(2, "0")}`,
    seats: n % 3 === 0 ? 6 : n % 2 === 0 ? 4 : 2,
    status: statuses[i % 4],
    guestName: statuses[i % 4] === "Occupied" ? `Guest ${n}` : null,
  };
});

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  await wait(120);
  return DASHBOARD;
}

export async function fetchPosCatalog(): Promise<PosMenuItem[]> {
  await wait(80);
  return POS_MENU;
}

export async function fetchTables(): Promise<TableRecord[]> {
  await wait(120);
  return TABLES;
}

export async function updateTableStatus(
  tableId: string,
  status: TableRecord["status"],
): Promise<TableRecord[]> {
  await wait(100);
  TABLES = TABLES.map((table) =>
    table.id === tableId ? { ...table, status } : table,
  );
  return TABLES;
}

export async function fetchIncomingQrOrders(): Promise<
  Array<{ id: string; source: string; amount: number }>
> {
  await wait(90);
  return [
    { id: "Q-1002", source: "Table 04", amount: 420 },
    { id: "Q-1003", source: "Room 216", amount: 880 },
  ];
}
