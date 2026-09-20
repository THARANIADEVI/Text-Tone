export default function FavoritesList({ favorites, onSelectVoice, onReplay, onRemove }) {
  if (!favorites.length) {
    return <p className="text-sm text-gray-400 text-center">No favorites yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 max-h-56 overflow-y-auto">
      {favorites.map((fav) => (
        <li key={fav.id} className="py-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {fav.favorite_type === "voice" ? (
              <p className="text-sm text-gray-800 truncate">
                Voice: {fav.voice_id} ({fav.language})
              </p>
            ) : (
              <p className="text-sm text-gray-800 truncate">
                {fav.history_text || "Clip deleted"}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {fav.favorite_type === "voice" ? (
              <button
                className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded hover:bg-teal-100"
                onClick={() => onSelectVoice(fav.language, fav.voice_id)}
              >
                Use
              </button>
            ) : (
              fav.history_audio_url && (
                <button
                  className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded hover:bg-teal-100"
                  onClick={() => onReplay(fav.history_audio_url)}
                >
                  Play
                </button>
              )
            )}
            <button
              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
              onClick={() => onRemove(fav.id)}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
