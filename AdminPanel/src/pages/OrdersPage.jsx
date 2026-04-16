import { Clock3, CookingPot, PackageCheck, Truck } from "lucide-react";

const ORDER_ROWS = [
  {
    id: "#3921",
    table: "T-04",
    items: 4,
    amount: "₹1,240",
    status: "Preparing",
    eta: "6m",
  },
  {
    id: "#3920",
    table: "T-11",
    items: 2,
    amount: "₹520",
    status: "Ready",
    eta: "2m",
  },
  {
    id: "#3919",
    table: "T-02",
    items: 6,
    amount: "₹1,980",
    status: "Served",
    eta: "Done",
  },
  {
    id: "#3918",
    table: "Takeaway",
    items: 3,
    amount: "₹760",
    status: "Dispatch",
    eta: "4m",
  },
];

const STATUS_CLASS = {
  Preparing: "bg-warning/20 text-ink",
  Ready: "bg-saffron-lt text-saffron",
  Served: "bg-sage-lt text-sage",
  Dispatch: "bg-info/15 text-info",
};

function StatCard(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase font-bold tracking-wide text-muted">
          {props.title}
        </p>
        <Icon size={16} className="text-muted2" />
      </div>
      <p className="text-3xl font-roboto font-black mt-3 text-ink">
        {props.value}
      </p>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Open Orders" value="28" icon={Clock3} />
        <StatCard title="In Kitchen" value="14" icon={CookingPot} />
        <StatCard title="Ready to Serve" value="9" icon={PackageCheck} />
        <StatCard title="Out for Delivery" value="5" icon={Truck} />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-ink">Live Order Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper text-muted uppercase text-xs">
              <tr>
                <th className="text-left py-3 px-5">Order</th>
                <th className="text-left py-3 px-5">Source</th>
                <th className="text-right py-3 px-5">Items</th>
                <th className="text-right py-3 px-5">Amount</th>
                <th className="text-left py-3 px-5">Status</th>
                <th className="text-right py-3 px-5">ETA</th>
              </tr>
            </thead>
            <tbody>
              {ORDER_ROWS.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-cream hover:bg-paper/60"
                >
                  <td className="py-3 px-5 font-semibold text-ink">{row.id}</td>
                  <td className="py-3 px-5">{row.table}</td>
                  <td className="py-3 px-5 text-right">{row.items}</td>
                  <td className="py-3 px-5 text-right font-semibold">
                    {row.amount}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-semibold ${STATUS_CLASS[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">{row.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
