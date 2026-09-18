import { useState } from "react";
import { extractTextFromFile } from "../api/ttsApi";

const MAX_CHARS = 500;

export default function FileUpload({ setText, setError }) {
  const [loading, setLoading] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-uploading the same file later
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".txt") && !name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setError("Only .txt, .pdf, and .docx files are supported.");
      return;
    }

    if (name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => {
        setError("");
        setText(String(reader.result).slice(0, MAX_CHARS));
      };
      reader.onerror = () => setError("Could not read the uploaded file.");
      reader.readAsText(file);
      return;
    }

    setError("");
    setLoading(true);
    extractTextFromFile(file)
      .then((text) => setText(text.slice(0, MAX_CHARS)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <label className="inline-block px-4 py-2 border border-dashed border-gray-400 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition">
      {loading ? "Extracting text..." : "Upload .txt, .pdf, or .docx file"}
      <input
        type="file"
        accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFile}
        disabled={loading}
      />
    </label>
  );
}
