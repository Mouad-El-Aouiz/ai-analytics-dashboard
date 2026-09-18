import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
}

function StatCard({
    title,
    value,
    change,
    trend,
}: StatCardProps) {
    const isPositive = trend === "up";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold text-gray-900">
                    {value}
                </p>

                <div
                    className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {isPositive ? (
                        <ArrowUp size={16} />
                    ) : (
                        <ArrowDown size={16} />
                    )}

                    {change}
                </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
                vs. previous period
            </p>
        </div>
    );

}

export default StatCard;