import { useState } from "react";
import { ShieldIcon, LogoutIcon } from "./icons";

export default function SettingsPage({
  email,
  isAdmin,
  onOpenAdmin,
  languages,
  defaultLanguage,
  defaultSpeed,
  onSavePreferences,
  onLogout,
}) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    onSavePreferences(language, speed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Account</h2>
        <p className="text-sm text-gray-500 mb-4">{email}</p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          <LogoutIcon className="h-4 w-4" />
          Log out
        </button>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Default generation preferences</h2>
        <p className="text-sm text-gray-400 mb-4">
          Applied automatically each time you open the Studio.
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default language:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default speed:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="slow">Slow</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
            >
              Save preferences
            </button>
            {saved && <span className="text-sm text-teal-600">Saved.</span>}
          </div>
        </form>
      </section>

      {isAdmin && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Admin</h2>
          <p className="text-sm text-gray-400 mb-4">
            You have admin access on this account.
          </p>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 text-sm px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition"
          >
            <ShieldIcon className="h-4 w-4" />
            Open Admin Dashboard
          </button>
        </section>
      )}
    </div>
  );
}
