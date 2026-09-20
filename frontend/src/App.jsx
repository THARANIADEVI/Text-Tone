import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StudioPage from "./components/StudioPage";
import HistoryPage from "./components/HistoryPage";
import VoicesPage from "./components/VoicesPage";
import SettingsPage from "./components/SettingsPage";
import AdminDashboard from "./components/AdminDashboard";
import {
  fetchLanguages,
  fetchVoices,
  generateSpeech,
  fetchHistory,
  deleteHistoryEntry,
  fetchFavorites,
  addFavorite,
  removeFavorite,
  fetchUsage,
} from "./api/ttsApi";
import { fetchMe, logout as logoutAuth } from "./api/authApi";

const PREFS_KEY = "tts_prefs";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

const PAGE_TITLES = {
  studio: { title: "Studio", subtitle: "Turn text into natural-sounding speech." },
  history: { title: "History", subtitle: "Your past speech generations." },
  voices: { title: "Voices", subtitle: "Starred voices and clips." },
  settings: { title: "Settings", subtitle: "Account and default preferences." },
  admin: { title: "Admin Dashboard", subtitle: "Usage across all users." },
};

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("studio");

  const prefs = loadPrefs();
  const [languages, setLanguages] = useState([]);
  const [voices, setVoices] = useState([]);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(prefs.language || "en");
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState(prefs.speed || "normal");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [usage, setUsage] = useState(null);

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

  function refreshUsage() {
    fetchUsage()
      .then(setUsage)
      .catch(() => {});
  }

  useEffect(() => {
    if (!user) return;
    fetchLanguages()
      .then(setLanguages)
      .catch((err) => setError(err.message));
    refreshHistory();
    refreshFavorites();
    refreshUsage();
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
      refreshUsage();
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
    setView("studio");
  }

  function handleSavePreferences(newLanguage, newSpeed) {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ language: newLanguage, speed: newSpeed }));
    setLanguage(newLanguage);
    setSpeed(newSpeed);
  }

  function handleLogout() {
    logoutAuth();
    setUser(null);
    setHistory([]);
    setFavorites([]);
    setAudioUrl("");
    setView("studio");
  }

  if (!authChecked) return null;
  if (!user) return <AuthForm onAuthenticated={setUser} />;

  const isAdmin = !!user.is_admin;
  const activeView = view === "admin" && !isAdmin ? "studio" : view;
  const { title, subtitle } = PAGE_TITLES[activeView];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar view={activeView} onNavigate={setView} isAdmin={isAdmin} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar title={title} subtitle={subtitle} email={user.email} onLogout={handleLogout} />

        <main className="flex-1 p-6 overflow-y-auto">
          {activeView === "studio" && (
            <StudioPage
              text={text}
              setText={setText}
              setError={setError}
              languages={languages}
              language={language}
              setLanguage={setLanguage}
              voices={voices}
              voice={voice}
              setVoice={setVoice}
              isVoiceFavorite={isVoiceFavorite}
              onToggleVoiceFavorite={handleToggleVoiceFavorite}
              speed={speed}
              setSpeed={setSpeed}
              error={error}
              usage={usage}
              loading={loading}
              audioUrl={audioUrl}
              onGenerate={handleGenerate}
              onClear={handleClear}
            />
          )}

          {activeView === "history" && (
            <HistoryPage
              history={history}
              onReplay={setAudioUrl}
              onDelete={handleDeleteHistory}
              onToggleFavorite={handleToggleHistoryFavorite}
              favoritedHistoryIds={favoritedHistoryIds}
            />
          )}

          {activeView === "voices" && (
            <VoicesPage
              favorites={favorites}
              onSelectVoice={handleSelectFavoriteVoice}
              onReplay={setAudioUrl}
              onRemove={handleRemoveFavorite}
            />
          )}

          {activeView === "settings" && (
            <SettingsPage
              email={user.email}
              isAdmin={isAdmin}
              onOpenAdmin={() => setView("admin")}
              languages={languages}
              defaultLanguage={language}
              defaultSpeed={speed}
              onSavePreferences={handleSavePreferences}
              onLogout={handleLogout}
            />
          )}

          {activeView === "admin" && <AdminDashboard />}
        </main>
      </div>
    </div>
  );
}
