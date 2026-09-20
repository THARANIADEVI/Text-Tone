import FavoritesList from "./FavoritesList";

export default function VoicesPage({ favorites, onSelectVoice, onReplay, onRemove }) {
  return (
    <div className="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-gray-400 mb-4">
        Voices and speech clips you've starred from the Studio show up here for quick reuse.
      </p>
      <FavoritesList favorites={favorites} onSelectVoice={onSelectVoice} onReplay={onReplay} onRemove={onRemove} />
    </div>
  );
}
