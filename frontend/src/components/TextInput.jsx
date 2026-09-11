const MAX_CHARS = 500;

export default function TextInput({ text, setText }) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Enter your text:</label>
      <textarea
        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        placeholder="Type or paste text here..."
        value={text}
        maxLength={MAX_CHARS}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>
          Characters: {charCount} / {MAX_CHARS}
        </span>
        <span>Words: {wordCount}</span>
      </div>
    </div>
  );
}
