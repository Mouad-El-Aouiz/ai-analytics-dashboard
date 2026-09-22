import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    changePercent: number | null;
    trend: "up" | "down" | "neutral";
}

function StatCard({
    title,
    value,
    changePercent,
    trend,
}: StatCardProps) {
    // changePercent === null arrive pour "All time" (rien à comparer)
    // ou quand la période précédente était à zéro (diviser par zéro n'a pas de sens).
    const changeLabel =
        changePercent === null
            ? trend === "up"
                ? "New"
                : "—"
            : `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`;

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
                    className={`flex items-center gap-1 text-sm font-medium ${trend === "up"
                        ? "text-green-600"
                        : trend === "down"
                            ? "text-red-600"
                            : "text-gray-400"
                        }`}
                >
                    {trend === "up" ? (
                        <ArrowUp size={16} />
                    ) : trend === "down" ? (
                        <ArrowDown size={16} />
                    ) : (
                        <Minus size={16} />
                    )}

                    {changeLabel}
                </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
                vs. previous period
            </p>
        </div>
    );

}

export default StatCard;