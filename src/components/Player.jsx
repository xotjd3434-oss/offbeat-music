import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  ListMusic,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cover, time } from "../data/tracks";

export default function Player({
  track,
  playing,
  togglePlay,
  next,
  previous,
  progress,
  duration,
  seek,
  volume,
  setVolume,
  shuffle,
  setShuffle,
  repeat,
  setRepeat,
  liked,
  toggleLike,
  queueOpen,
  setQueueOpen,
  expanded,
  setExpanded,
}) {
  return (
    <footer
      className={`music-player ${expanded ? "is-expanded" : ""}`}
      aria-label="음악 플레이어"
    >
      <div className="player-track">
        <img src={cover(track)} alt="" />
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <button
          className={`icon-button player-heart ${liked ? "is-liked" : ""}`}
          onClick={() => toggleLike(track.id)}
          aria-label={liked ? "현재 곡 찜 해제" : "현재 곡 찜하기"}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="player-main">
        <div className="playback-controls">
          <button
            className={`icon-button secondary-control ${shuffle ? "is-active" : ""}`}
            aria-label="셔플"
            aria-pressed={shuffle}
            onClick={() => setShuffle(!shuffle)}
          >
            <Shuffle size={17} />
          </button>
          <button
            className="icon-button"
            onClick={previous}
            aria-label="이전 곡"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            className="main-play"
            onClick={togglePlay}
            aria-label={playing ? "일시 정지" : "재생"}
          >
            {playing ? (
              <Pause size={21} fill="currentColor" />
            ) : (
              <Play size={21} fill="currentColor" />
            )}
          </button>
          <button className="icon-button" onClick={next} aria-label="다음 곡">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            className={`icon-button secondary-control ${repeat ? "is-active" : ""}`}
            onClick={() => setRepeat(!repeat)}
            aria-pressed={repeat}
            aria-label="한 곡 반복"
          >
            <Repeat size={17} />
          </button>
        </div>
        <div className="seek-control">
          <span>{time(progress)}</span>
          <input
            type="range"
            aria-label="재생 위치"
            min="0"
            max={duration || 1}
            step="0.1"
            value={Math.min(progress, duration || 1)}
            onChange={(e) => seek(Number(e.target.value))}
            style={{
              "--fill": `${duration ? (progress / duration) * 100 : 0}%`,
            }}
          />
          <span>{time(duration)}</span>
        </div>
      </div>
      <div className="player-tools">
        <span className="demo-chip">데모 음원</span>
        <div className="volume-control">
          <button
            className="icon-button"
            aria-label={volume ? "음소거" : "음소거 해제"}
            onClick={() => setVolume(volume ? 0 : 0.4)}
          >
            {volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            type="range"
            aria-label="볼륨"
            min="0"
            max="1"
            step=".01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ "--fill": `${volume * 100}%` }}
          />
        </div>
        <button
          className={`icon-button ${queueOpen ? "is-active" : ""}`}
          onClick={() => setQueueOpen(!queueOpen)}
          aria-label="재생목록"
          aria-expanded={queueOpen}
        >
          <ListMusic size={20} />
        </button>
        <button
          className="icon-button expand-player"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "플레이어 접기" : "플레이어 펼치기"}
        >
          {expanded ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
        </button>
      </div>
    </footer>
  );
}
