import { useState, type FormEvent } from "react";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";

import type { AiAssistantResponse, AiContext } from "../../types/ai";

interface AssistantChatProps {
  context: AiContext | null;
  // Le hook useAiAssistant est passé en props pour rester testable.
  answer: AiAssistantResponse | null;
  loading: boolean;
  error: string | null;
  onAsk: (question: string) => Promise<void>;
  onReset: () => void;
}

// Quelques questions suggérées pour guider l'utilisateur.
const SUGGESTED_QUESTIONS = [
  "Why did revenue change this period?",
  "Which product generates the most revenue?",
  "Compare this period with the previous one.",
  "What should I investigate?",
];

function AssistantChat({
  context,
  answer,
  loading,
  error,
  onAsk,
  onReset,
}: AssistantChatProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!question.trim() || !context) return;

    await onAsk(question.trim());
    setQuestion("");
  };

  const handleSuggestion = async (suggestion: string) => {
    if (!context) return;

    setQuestion(suggestion);
    await onAsk(suggestion);
    setQuestion("");
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <MessageCircle size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              AI Analytics Assistant
            </h2>

            <p className="text-xs text-gray-500">
              Ask questions about your data.
            </p>
          </div>
        </div>

        {answer && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>

      {/* Suggested questions (visible quand pas encore de réponse) */}
      {!answer && !loading && (
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-500">
              Suggested questions
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                disabled={!context}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="border-b border-gray-100 bg-gray-50 p-5">
          <p className="text-sm leading-6 text-gray-900">{answer.answer}</p>

          {answer.keyPoints.length > 0 && (
            <ul className="mt-3 space-y-1">
              {answer.keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 border-b border-gray-100 p-5">
          <Loader2 size={16} className="animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Thinking…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="border-b border-gray-100 p-5">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            context
              ? "Ask a question about your data…"
              : "Waiting for analytics data…"
          }
          disabled={!context || loading}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
        />

        <button
          type="submit"
          disabled={!context || !question.trim() || loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white transition hover:bg-gray-800 disabled:opacity-30"
          aria-label="Send question"
        >
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}

export default AssistantChat;