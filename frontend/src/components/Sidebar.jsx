import Logo from "./Logo";
import { StudioIcon, HistoryIcon, StarIcon, SettingsIcon, ShieldIcon } from "./icons";

const NAV_ITEMS = [
  { id: "studio", label: "Studio", icon: StudioIcon },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "voices", label: "Voices", icon: StarIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ view, onNavigate, isAdmin }) {
  const items = isAdmin ? [...NAV_ITEMS, { id: "admin", label: "Admin", icon: ShieldIcon }] : NAV_ITEMS;

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <Logo className="h-8 w-8 shrink-0" />
        <div>
          <p className="font-bold text-gray-800 leading-tight">Text-Tone</p>
          <p className="text-xs text-gray-400 leading-tight">text &middot; to &middot; speech</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ id, label, icon: ItemIcon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                active ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ItemIcon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
