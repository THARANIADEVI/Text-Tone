const MAX_CHARS = 500;

export default function FileUpload({ setText, setError }) {
  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-uploading the same file later
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Only .txt files are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      setText(String(reader.result).slice(0, MAX_CHARS));
    };
    reader.onerror = () => setError("Could not read the uploaded file.");
    reader.readAsText(file);
  }

  return (
    <label className="inline-block px-4 py-2 border border-dashed border-gray-400 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition">
      Upload .txt file
      <input type="file" accept=".txt,text/plain" className="hidden" onChange={handleFile} />
    </label>
  );
}
