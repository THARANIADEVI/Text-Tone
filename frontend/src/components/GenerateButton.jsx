export default function GenerateButton({ onClick, loading, disabled }) {
  return (
    <button
      className="w-full sm:w-auto px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Generating..." : "Generate Speech"}
    </button>
  );
}
