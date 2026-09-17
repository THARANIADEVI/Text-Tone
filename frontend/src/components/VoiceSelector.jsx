export default function VoiceSelector({ voices, voice, setVoice, isFavorite, onToggleFavorite }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Voice:</label>
      <div className="flex gap-1">
        <select
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          disabled={voices.length === 0}
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
        {onToggleFavorite && (
          <button
            type="button"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={`px-2 rounded-lg border ${isFavorite ? "text-yellow-500 border-yellow-300" : "text-gray-300 border-gray-300"} hover:bg-gray-50`}
            onClick={onToggleFavorite}
            disabled={!voice}
          >
            ★
          </button>
        )}
      </div>
    </div>
  );
}
