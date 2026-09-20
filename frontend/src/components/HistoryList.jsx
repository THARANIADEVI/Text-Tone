export default function HistoryList({ history, onReplay, onDelete, onToggleFavorite, favoritedHistoryIds }) {
  if (!history.length) {
    return <p className="text-sm text-gray-400 text-center">No speech history yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
      {history.map((item) => (
        <li key={item.id} className="py-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-800 truncate">{item.text}</p>
            <p className="text-xs text-gray-400">
              {item.language} / {item.voice} · {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {onToggleFavorite && (
              <button
                title={favoritedHistoryIds?.has(item.id) ? "Remove from favorites" : "Add to favorites"}
                className={`text-xs px-2 ${favoritedHistoryIds?.has(item.id) ? "text-yellow-500" : "text-gray-300"} hover:text-yellow-500`}
                onClick={() => onToggleFavorite(item.id)}
              >
                ★
              </button>
            )}
            <button
              className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded hover:bg-teal-100"
              onClick={() => onReplay(item.audio_url)}
            >
              Play
            </button>
            <button
              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
