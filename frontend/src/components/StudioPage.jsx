import TextInput from "./TextInput";
import LanguageSelector from "./LanguageSelector";
import VoiceSelector from "./VoiceSelector";
import SpeedSelector from "./SpeedSelector";
import FileUpload from "./FileUpload";
import AIEnhance from "./AIEnhance";
import GenerateButton from "./GenerateButton";
import AudioPlayer from "./AudioPlayer";
import DownloadButton from "./DownloadButton";
import ErrorMessage from "./ErrorMessage";
import UsageBadge from "./UsageBadge";

export default function StudioPage({
  text,
  setText,
  setError,
  languages,
  language,
  setLanguage,
  voices,
  voice,
  setVoice,
  isVoiceFavorite,
  onToggleVoiceFavorite,
  speed,
  setSpeed,
  error,
  usage,
  loading,
  audioUrl,
  onGenerate,
  onClear,
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <TextInput text={text} setText={setText} />
      <div className="flex flex-wrap items-center gap-2">
        <FileUpload setText={setText} setError={setError} />
        <AIEnhance text={text} setText={setText} setError={setError} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LanguageSelector languages={languages} language={language} setLanguage={setLanguage} />
        <VoiceSelector
          voices={voices}
          voice={voice}
          setVoice={setVoice}
          isFavorite={isVoiceFavorite}
          onToggleFavorite={onToggleVoiceFavorite}
        />
        <SpeedSelector speed={speed} setSpeed={setSpeed} />
      </div>

      <ErrorMessage message={error} />

      <UsageBadge usage={usage} />

      <div className="flex gap-3">
        <GenerateButton
          onClick={onGenerate}
          loading={loading}
          disabled={!text.trim() || (usage?.limit != null && usage.used >= usage.limit)}
        />
        <button
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <AudioPlayer audioUrl={audioUrl} speed={speed} />
      <DownloadButton audioUrl={audioUrl} />
    </div>
  );
}
