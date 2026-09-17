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
import FavoritesList from "./components/FavoritesList";
import AuthForm from "./components/AuthForm";
import {
  fetchLanguages,
  fetchVoices,
  generateSpeech,
  fetchHistory,
  deleteHistoryEntry,
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "./api/ttsApi";
import { fetchMe, logout as logoutAuth } from "./api/authApi";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

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
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .finally(() => setAuthChecked(true));
  }, []);

  function refreshHistory() {
    fetchHistory()
      .then(setHistory)
      .catch((err) => setError(err.message));
  }

  function refreshFavorites() {
    fetchFavorites()
      .then(setFavorites)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    if (!user) return;
    fetchLanguages()
      .then(setLanguages)
      .catch((err) => setError(err.message));
    refreshHistory();
    refreshFavorites();
  }, [user]);

  useEffect(() => {
    if (!user || !language) return;
    fetchVoices(language)
      .then((v) => {
        setVoices(v);
        setVoice(v[0]?.id || "");
      })
      .catch((err) => setError(err.message));
  }, [user, language]);

  const favoriteVoices = favorites.filter((f) => f.favorite_type === "voice");
  const isVoiceFavorite = favoriteVoices.some((f) => f.language === language && f.voice_id === voice);
  const favoritedHistoryIds = new Set(
    favorites.filter((f) => f.favorite_type === "history").map((f) => f.history_id)
  );

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

  async function handleToggleVoiceFavorite() {
    try {
      if (isVoiceFavorite) {
        const fav = favoriteVoices.find((f) => f.language === language && f.voice_id === voice);
        await removeFavorite(fav.id);
      } else {
        await addFavorite({ favorite_type: "voice", language, voice_id: voice });
      }
      refreshFavorites();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleHistoryFavorite(historyId) {
    try {
      const existing = favorites.find(
        (f) => f.favorite_type === "history" && f.history_id === historyId
      );
      if (existing) {
        await removeFavorite(existing.id);
      } else {
        await addFavorite({ favorite_type: "history", history_id: historyId });
      }
      refreshFavorites();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveFavorite(id) {
    try {
      await removeFavorite(id);
      refreshFavorites();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSelectFavoriteVoice(favLanguage, favVoiceId) {
    setLanguage(favLanguage);
    setVoice(favVoiceId);
  }

  function handleLogout() {
    logoutAuth();
    setUser(null);
    setHistory([]);
    setFavorites([]);
    setAudioUrl("");
  }

  if (!authChecked) return null;
  if (!user) return <AuthForm onAuthenticated={setUser} />;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Text to Speech</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{user.email}</span>
            <button className="text-indigo-600 hover:underline" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <TextInput text={text} setText={setText} />
        <FileUpload setText={setText} setError={setError} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LanguageSelector languages={languages} language={language} setLanguage={setLanguage} />
          <VoiceSelector
            voices={voices}
            voice={voice}
            setVoice={setVoice}
            isFavorite={isVoiceFavorite}
            onToggleFavorite={handleToggleVoiceFavorite}
          />
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
          <HistoryList
            history={history}
            onReplay={setAudioUrl}
            onDelete={handleDeleteHistory}
            onToggleFavorite={handleToggleHistoryFavorite}
            favoritedHistoryIds={favoritedHistoryIds}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Favorites</h2>
          <FavoritesList
            favorites={favorites}
            onSelectVoice={handleSelectFavoriteVoice}
            onReplay={setAudioUrl}
            onRemove={handleRemoveFavorite}
          />
        </div>
      </div>
    </div>
  );
}
