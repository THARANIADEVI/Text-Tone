export default function VoiceSelector({ voices, voice, setVoice }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Voice:</label>
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
    </div>
  );
}
