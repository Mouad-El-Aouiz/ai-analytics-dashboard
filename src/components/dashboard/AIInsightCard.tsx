import { ArrowRight, Sparkles } from "lucide-react";

function AIInsightCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Sparkles size={20} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            AI Insight
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            Revenue increased by 18.4% during the selected
            period. Your strongest growth came from the
            Enterprise segment.
          </p>

          <button className="mt-3 flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
            View AI Insights
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIInsightCard;