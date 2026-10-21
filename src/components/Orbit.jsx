import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { tracks, cover } from "../data/tracks";

export default function Orbit({ playTrack }) {
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return (
    <div className="orbit-scene">
      <div className="orbit-halo" />
      <div className="orbit-wrapper">
        <div
          className={`orbit-inner ${paused ? "is-paused" : ""}`}
          style={{ "--quantity": tracks.length }}
        >
          {tracks.map((track, index) => (
            <button
              className="orbit-card"
              key={track.id}
              style={{ "--index": index, "--card-color": track.color }}
              onClick={() => playTrack(track.id)}
              aria-label={`${track.title} 재생`}
            >
              <img src={cover(track)} alt="" draggable="false" />
              <span className="orbit-card-copy">
                <small>{track.artist}</small>
                <strong>{track.title}</strong>
              </span>
              <span className="orbit-play">
                <Play size={20} fill="currentColor" />
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="orbit-bottom">
        <button
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "커버 회전 재개" : "커버 회전 정지"}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          <span>{paused ? "회전 재개" : "회전 정지"}</span>
        </button>
      </div>
    </div>
  );
}
