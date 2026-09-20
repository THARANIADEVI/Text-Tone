import { useEffect, useRef } from "react";

// gTTS's own "slow" flag only changes pacing by ~20% (see backend speed docs),
// too subtle to notice on short clips. Stacking actual audio.playbackRate on
// top makes "Slow" audibly distinct instead of sounding identical to "Normal".
const PLAYBACK_RATE = { normal: 1, slow: 0.75 };

export default function AudioPlayer({ audioUrl, speed = "normal" }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = PLAYBACK_RATE[speed] ?? 1;
    }
  }, [audioUrl, speed]);

  if (!audioUrl) return null;

  return (
    <div className="w-full mt-2">
      <h2 className="text-sm font-medium text-gray-700 mb-2">Generated Audio</h2>
      <audio ref={audioRef} className="w-full" controls src={audioUrl}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
