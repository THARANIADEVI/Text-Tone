export default function AudioPlayer({ audioUrl }) {
  if (!audioUrl) return null;

  return (
    <div className="w-full mt-2">
      <h2 className="text-sm font-medium text-gray-700 mb-2">Generated Audio</h2>
      <audio className="w-full" controls src={audioUrl}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
