export default function LanguageSelector({ languages, language, setLanguage }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Language:</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
