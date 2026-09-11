import { useEffect, useState } from "react";
import TextInput from "./components/TextInput";
import LanguageSelector from "./components/LanguageSelector";
import VoiceSelector from "./components/VoiceSelector";
import SpeedSelector from "./components/SpeedSelector";
import FileUpload from "./components/FileUpload";
import GenerateButton from "./components/GenerateButton";
import AudioPlayer from "./components/AudioPlayer";
import DownloadButton from "./components/DownloadButton";
import ErrorMessage from "./components/ErrorMessage";
import HistoryList from "./components/HistoryList";
import {
  fetchLanguages,
  fetchVoices,
  generateSpeech,
  fetchHistory,
  deleteHistoryEntry,
} from "./api/ttsApi";

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [voices, setVoices] = useState([]);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState("normal");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  function refreshHistory() {
    fetchHistory()
      .then(setHistory)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    fetchLanguages()
      .then(setLanguages)
      .catch((err) => setError(err.message));
    refreshHistory();
  }, []);

  useEffect(() => {
    if (!language) return;
    fetchVoices(language)
      .then((v) => {
        setVoices(v);
        setVoice(v[0]?.id || "");
      })
      .catch((err) => setError(err.message));
  }, [language]);

  async function handleGenerate() {
    setError("");
    setAudioUrl("");

    if (!text.trim()) {
      setError("Please enter some text before generating speech.");
      return;
    }

    setLoading(true);
    try {
      const url = await generateSpeech({ text, language, voice, speed });
      setAudioUrl(url);
      refreshHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setText("");
    setAudioUrl("");
    setError("");
  }

  async function handleDeleteHistory(id) {
    try {
      await deleteHistoryEntry(id);
      refreshHistory();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">Text to Speech</h1>

        <TextInput text={text} setText={setText} />
        <FileUpload setText={setText} setError={setError} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LanguageSelector languages={languages} language={language} setLanguage={setLanguage} />
          <VoiceSelector voices={voices} voice={voice} setVoice={setVoice} />
          <SpeedSelector speed={speed} setSpeed={setSpeed} />
        </div>

        <ErrorMessage message={error} />

        <div className="flex gap-3">
          <GenerateButton onClick={handleGenerate} loading={loading} disabled={!text.trim()} />
          <button
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

        <AudioPlayer audioUrl={audioUrl} />
        <DownloadButton audioUrl={audioUrl} />

        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Speech History</h2>
          <HistoryList history={history} onReplay={setAudioUrl} onDelete={handleDeleteHistory} />
        </div>
      </div>
    </div>
  );
}
