export default function GenerateButton({ onClick, loading, disabled }) {
  return (
    <button
      className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Generating..." : "Generate Speech"}
    </button>
  );
}
