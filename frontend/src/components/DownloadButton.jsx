export default function DownloadButton({ audioUrl }) {
  if (!audioUrl) return null;

  return (
    <a
      className="inline-block px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition"
      href={audioUrl}
      download="generated-speech.mp3"
    >
      Download Audio
    </a>
  );
}
