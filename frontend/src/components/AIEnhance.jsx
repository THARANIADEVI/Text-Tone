import { useState } from "react";
import { enhanceText } from "../api/ttsApi";

const ACTIONS = [
  { id: "summarize", label: "Summarize" },
  { id: "grammar", label: "Fix Grammar" },
  { id: "rewrite", label: "Rewrite" },
  { id: "conversational", label: "Make Conversational" },
];

export default function AIEnhance({ text, setText, setError }) {
  const [loadingAction, setLoadingAction] = useState(null);

  function handleEnhance(action) {
    if (!text.trim()) {
      setError("Enter some text before using AI enhancement.");
      return;
    }
    setError("");
    setLoadingAction(action);
    enhanceText(text, action)
      .then(setText)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingAction(null));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className="px-3 py-1.5 text-xs font-medium border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          onClick={() => handleEnhance(id)}
          disabled={loadingAction !== null}
        >
          {loadingAction === id ? "Working..." : label}
        </button>
      ))}
    </div>
  );
}
