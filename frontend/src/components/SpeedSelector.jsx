export default function SpeedSelector({ speed, setSpeed }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Speed:</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={speed}
        onChange={(e) => setSpeed(e.target.value)}
      >
        <option value="normal">Normal</option>
        <option value="slow">Slow</option>
      </select>
    </div>
  );
}
