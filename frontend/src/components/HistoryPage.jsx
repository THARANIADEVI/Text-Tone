import HistoryList from "./HistoryList";

export default function HistoryPage({ history, onReplay, onDelete, onToggleFavorite, favoritedHistoryIds }) {
  return (
    <div className="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <HistoryList
        history={history}
        onReplay={onReplay}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        favoritedHistoryIds={favoritedHistoryIds}
      />
    </div>
  );
}
