import type { OrdersByStatus as OrdersByStatusData } from "../../types/analytics";
import { ORDER_STATUS_STYLES } from "../../utils/orderStatusStyles";

interface OrdersByStatusProps {
  data: OrdersByStatusData[];
}

function OrdersByStatus({ data }: OrdersByStatusProps) {
  const totalOrders = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Orders by status
        </h2>
        <p className="text-sm text-gray-500">
          {totalOrders.toLocaleString()} orders in this period
        </p>
      </div>

      {totalOrders === 0 ? (
        <p className="text-sm text-gray-500">
          No orders in this period.
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((row) => {
            const style = ORDER_STATUS_STYLES[row.status];
            const percent = (row.count / totalOrders) * 100;

            return (
              <div key={row.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <span className="text-gray-600">
                    {row.count.toLocaleString()} ·{" "}
                    ${row.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${style.bar}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersByStatus;