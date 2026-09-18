import { type RecentOrder } from "../../types/analytics";

interface RecentOrdersProps {
  orders: RecentOrder[];
}

function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900">
          Recent Orders
        </h2>

        <p className="text-sm text-gray-500">
          Latest customer orders
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-100"
              >
                <td className="px-5 py-4 font-medium text-gray-900">
                  #{order.id.slice(0, 8)}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {order.customers?.[0]?.name ?? "Unknown"}
                </td>

                <td className="px-5 py-4 text-gray-900">
                  ${Number(order.total_amount).toLocaleString()}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentOrders;