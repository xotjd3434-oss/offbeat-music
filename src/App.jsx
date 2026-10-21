import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AudioLines,
  Search,
  Heart,
  Play,
  Pause,
  Headphones,
  Disc3,
  X,
  Plus,
  ListMusic,
  Volume2,
} from "lucide-react";
import TiltCard from "./components/TiltCard";
import Orbit from "./components/Orbit";
import Player from "./components/Player";
import { tracks, genres, cover, audio } from "./data/tracks";

const pickRandom = (values) =>
  values[Math.floor(Math.random() * values.length)];

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

function Equalizer({ playing }) {
  return (
    <span
      className={`equalizer ${playing ? "is-playing" : ""}`}
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <i key={i} style={{ "--i": i }} />
      ))}
    </span>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("전체");
  const [mood, setMood] = useState("");
  const [currentId, setCurrentId] = useState(tracks[0].id);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, changeVolume] = useState(() => {
    const v = read("offbeat-volume", 0.4);
    return typeof v === "number" && v >= 0 && v <= 1 ? v : 0.4;
  });
  const [favorites, setFavorites] = useState(() => {
    const v = read("offbeat-likes", []);
    return Array.isArray(v)
      ? [...new Set(v.filter((id) => tracks.some((t) => t.id === id)))]
      : [];
  });
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState("");
  const [queue, setQueue] = useState(tracks.map((t) => t.id));
  const media = useRef(null);
  const intent = useRef(false);
  const current = tracks.find((t) => t.id === currentId);
  const savedView = pathname === "/library";
  const home = pathname === "/";
  const filtered = tracks.filter(
    (t) =>
      (!savedView || favorites.includes(t.id)) &&
      (genre === "전체" || t.genre === genre) &&
      (!mood || t.mood === mood) &&
      `${t.title} ${t.artist} ${t.genre} ${t.mood}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );

  const tryPlay = () => {
    const player = media.current;
    if (!player) return;
    intent.current = true;
    player.play().catch((error) => {
      if (error.name !== "AbortError") {
        intent.current = false;
        setPlaying(false);
        setNotice("음원을 재생하지 못했어요. 재생 버튼을 다시 눌러주세요.");
      }
    });
  };
  const playTrack = (id) => {
    if (currentId === id) {
      tryPlay();
      return;
    }
    intent.current = true;
    setCurrentId(id);
  };
  const togglePlay = () => {
    if (playing) {
      intent.current = false;
      media.current?.pause();
    } else tryPlay();
  };
  const next = () => {
    const order = queue.length ? queue : tracks.map((t) => t.id);
    const position = order.indexOf(currentId);
    const choices = order.filter((id) => id !== currentId);
    const id =
      shuffle && choices.length
        ? pickRandom(choices)
        : order[(position + 1) % order.length];
    if (id === currentId) {
      media.current.currentTime = 0;
      tryPlay();
    } else playTrack(id);
  };
  const previous = () => {
    if (media.current?.currentTime > 3) {
      media.current.currentTime = 0;
      return;
    }
    const order = queue.length ? queue : tracks.map((t) => t.id);
    const index = order.indexOf(currentId);
    playTrack(order[(index - 1 + order.length) % order.length]);
  };
  const toggleLike = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  const addQueue = (id) => {
    if (queue.includes(id)) {
      setNotice("이미 재생목록에 있는 곡이에요.");
      return;
    }
    setQueue((prev) => [...prev, id]);
    setNotice("재생목록에 추가했어요.");
  };
  const seek = (value) => {
    if (media.current && Number.isFinite(media.current.duration)) {
      media.current.currentTime = value;
      setProgress(value);
    }
  };

  useEffect(() => {
    const player = media.current;
    player.load();
    if (intent.current)
      player.play().catch((error) => {
        if (error.name !== "AbortError") {
          intent.current = false;
          setNotice("재생 버튼을 눌러 음악을 시작해 주세요.");
        }
      });
  }, [currentId]);
  useEffect(() => {
    media.current.volume = volume;
    try {
      localStorage.setItem("offbeat-volume", JSON.stringify(volume));
    } catch {
      void 0;
    }
  }, [volume]);
  useEffect(() => {
    try {
      localStorage.setItem("offbeat-likes", JSON.stringify(favorites));
    } catch {
      void 0;
    }
  }, [favorites]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2800);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!queueOpen) return;
    const close = (event) => {
      if (event.key === "Escape") setQueueOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [queueOpen]);
  useEffect(() => {
    const keydown = (event) => {
      if (
        event.code !== "Space" ||
        event.target.closest(
          "input, textarea, button, a, summary, [contenteditable]",
        )
      )
        return;
      event.preventDefault();
      if (media.current.paused) {
        intent.current = true;
        media.current
          .play()
          .catch(() => setNotice("재생 버튼을 다시 눌러주세요."));
      } else {
        intent.current = false;
        media.current.pause();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, []);

  return (
    <div className="app-shell">
      <audio
        ref={media}
        src={audio(current)}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setProgress(0);
        }}
        onEnded={() => {
          if (repeat) {
            media.current.currentTime = 0;
            tryPlay();
          } else next();
        }}
        onError={() => {
          setPlaying(false);
          setNotice("음원 파일을 확인해 주세요.");
        }}
      />
      <a className="skip-link" href="#main-content">
        본문 바로가기
      </a>
      <header className="site-header">
        <NavLink className="wordmark" to="/" aria-label="오프비트 홈">
          <AudioLines size={29} strokeWidth={2.4} />
          오프비트
        </NavLink>
        <nav className="main-nav" aria-label="메인 메뉴">
          <NavLink to="/" end>
            추천 음악
          </NavLink>
          <NavLink to="/explore">전체</NavLink>
          <NavLink to="/library">
            찜한 음악 <span>{favorites.length}</span>
          </NavLink>
        </nav>
        <div className="header-end">
          <button
            className="profile-button"
            aria-label="재생목록 열기"
            onClick={() => setQueueOpen(true)}
          >
            <Headphones size={19} />
          </button>
        </div>
      </header>
      <main id="main-content">
        {home && (
          <section className="hero">
            <div className="hero-copy">
              <h1>
                좋아하는 음악,
                <br />
                <span>계속 듣고 싶게.</span>
              </h1>
              <p>
                지금의 기분에 딱 맞는 사운드.
                <br />
                취향 밖의 음악까지, 새로운 발견을 시작해요.
              </p>
              <div className="hero-footnote">
                <span className="stacked-covers">
                  {tracks.slice(0, 3).map((t) => (
                    <img key={t.id} src={cover(t)} alt="" />
                  ))}
                </span>
                <span>
                  일상에 새로운 리듬을 더해요.
                  <br />
                  <strong>다시 듣고 싶은 음악을 발견하세요.</strong>
                </span>
              </div>
            </div>
            <Orbit playTrack={playTrack} />
          </section>
        )}
        <section className="sound-section" id="sound-selection">
          <div className="section-top">
            <div>
              <div className="eyebrow">
                {savedView
                  ? "나만의 취향을 모아두는 곳"
                  : home
                    ? "지금의 기분에 맞춘 선곡"
                    : "새로운 음악을 만나는 시간"}
              </div>
              <h2>
                {savedView
                  ? "찜한 음악"
                  : home
                    ? "지금, 나에게 맞는 음악"
                    : "모든 음악"}
              </h2>
              <p>
                {savedView
                  ? "다시 듣고 싶은 음악을 한곳에."
                  : "오늘의 리듬은 어떤가요? 원하는 무드부터 골라보세요."}
              </p>
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                aria-label="음악 검색"
                placeholder="곡, 아티스트, 무드 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="검색어 지우기" onClick={() => setQuery("")}>
                  <X size={16} />
                </button>
              )}
            </label>
          </div>
          <fieldset className="neon-mood-picker">
            <legend>지금 듣고 싶은 분위기</legend>
            <div className="neon-mood-options">
              {[
                { value: "", label: "모든 분위기" },
                { value: "느긋한 아침", label: "느긋한 아침" },
                { value: "깊은 집중", label: "깊은 집중" },
                { value: "밤 드라이브", label: "밤 드라이브" },
              ].map((option, index) => (
                <label key={option.value} htmlFor={`neon-mood-${index}`}>
                  <input
                    id={`neon-mood-${index}`}
                    type="radio"
                    name="music-mood"
                    value={option.value}
                    checked={mood === option.value}
                    onChange={() => setMood(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="filter-row">
            <div className="genre-filters" role="group" aria-label="장르 필터">
              {genres.map((g) => (
                <button
                  className={g === genre ? "selected" : ""}
                  onClick={() => setGenre(g)}
                  key={g}
                  aria-pressed={g === genre}
                >
                  {g}
                </button>
              ))}
            </div>
            <span className="result-count">
              {filtered.length}곡을 발견했어요
            </span>
          </div>
          {mood && (
            <button className="active-mood" onClick={() => setMood("")}>
              {mood}
              <X size={14} /> 무드 해제
            </button>
          )}
          <div className="album-grid">
            {filtered.slice(0, home ? 6 : 10).map((track) => (
              <TiltCard key={track.id}>
                <div className="album-art">
                  <img
                    src={cover(track)}
                    alt={`${track.title} 커버`}
                    loading="lazy"
                  />
                  <span className="album-genre">{track.genre}</span>
                  <button
                    className={`album-like ${favorites.includes(track.id) ? "is-liked" : ""}`}
                    aria-label={`${track.title} ${favorites.includes(track.id) ? "찜 해제" : "찜하기"}`}
                    aria-pressed={favorites.includes(track.id)}
                    onClick={() => toggleLike(track.id)}
                  >
                    <Heart
                      size={18}
                      fill={
                        favorites.includes(track.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                  <button
                    className="album-play"
                    aria-label={`${track.title} ${playing && currentId === track.id ? "일시 정지" : "재생"}`}
                    onClick={() =>
                      currentId === track.id && playing
                        ? togglePlay()
                        : playTrack(track.id)
                    }
                  >
                    {playing && currentId === track.id ? (
                      <Pause fill="currentColor" size={23} />
                    ) : (
                      <Play fill="currentColor" size={23} />
                    )}
                  </button>
                  <span className="cover-stamp">오프비트의 선곡</span>
                </div>
                <div className="album-info">
                  <div>
                    <button
                      className="track-title"
                      onClick={() => playTrack(track.id)}
                    >
                      {track.title}
                    </button>
                    <p>{track.artist}</p>
                  </div>
                  {currentId === track.id && <Equalizer playing={playing} />}
                </div>
                <p className="album-description">{track.description}</p>
              </TiltCard>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <Disc3 size={42} />
              <h3>
                {savedView && !favorites.length
                  ? "아직 저장한 음악이 없어요."
                  : "이 조건에 맞는 음악이 없어요."}
              </h3>
              <p>하트를 눌러 저장하거나 다른 검색어와 필터로 찾아보세요.</p>
              <button
                className="button"
                onClick={() => {
                  setQuery("");
                  setGenre("전체");
                  setMood("");
                }}
              >
                필터 초기화
              </button>
            </div>
          )}
        </section>
        {home && (
          <section className="mood-section">
            <div className="section-top">
              <div>
                <div className="eyebrow">일상의 모든 순간에 음악을</div>
                <h2>지금의 분위기를 골라보세요</h2>
              </div>
              <span className="muted-copy">
                어떤 순간에도, 음악은 있으니까.
              </span>
            </div>
            <div className="mood-grid">
              {[
                {
                  name: "느긋한 아침",
                  sub: "천천히 시작해도 괜찮은 아침",
                  image: tracks[1],
                  tag: "천천히 시작하는 하루",
                },
                {
                  name: "깊은 집중",
                  sub: "생각은 선명하게, 소음은 멀리",
                  image: tracks[6],
                  tag: "나만의 세계에 집중할 때",
                },
                {
                  name: "밤 드라이브",
                  sub: "목적지 없이 달리고 싶은 밤",
                  image: tracks[0],
                  tag: "해가 진 뒤의 드라이브",
                },
              ].map((m) => (
                <button
                  className="mood-card"
                  key={m.name}
                  onClick={() => {
                    setMood(m.name);
                    setGenre("전체");
                    setQuery("");
                    document
                      .getElementById("sound-selection")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <img src={cover(m.image)} alt="" />
                  <div>
                    <small>{m.tag}</small>
                    <h3>{m.name}</h3>
                    <p>{m.sub}</p>
                  </div>
                  <span className="mood-arrow">
                    <span className="direction-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        {!savedView && (
          <section className="track-section">
            <div className="section-top">
              <div>
                <div className="eyebrow">좋은 음악은 계속 이어져요</div>
                <h2>{home ? "오늘의 재생목록" : "전체 곡 둘러보기"}</h2>
              </div>
              <span className="track-count">
                {tracks.length} 자체 제작 데모 음원
              </span>
            </div>
            <div className="track-table">
              <div className="track-table-head">
                <span>#</span>
                <span>곡명 / 아티스트</span>
                <span>장르</span>
                <span>분위기</span>
                <span>재생 시간</span>
                <span />
              </div>
              {tracks.map((t, i) => (
                <div
                  className={`track-row ${currentId === t.id ? "is-current" : ""}`}
                  key={t.id}
                >
                  <button
                    className="track-number"
                    aria-label={`${t.title} 목록에서 재생`}
                    onClick={() => playTrack(t.id)}
                  >
                    {currentId === t.id && playing ? (
                      <Equalizer playing />
                    ) : (
                      <>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <Play size={15} fill="currentColor" />
                      </>
                    )}
                  </button>
                  <button
                    className="track-cell"
                    onClick={() => playTrack(t.id)}
                  >
                    <img src={cover(t)} alt="" />
                    <span>
                      <strong>{t.title}</strong>
                      <small>{t.artist}</small>
                    </span>
                  </button>
                  <span className="row-genre">{t.genre}</span>
                  <span className="row-mood">{t.mood}</span>
                  <span className="row-duration">0:48</span>
                  <div className="track-row-tools">
                    <button
                      className={`icon-button ${favorites.includes(t.id) ? "is-liked" : ""}`}
                      onClick={() => toggleLike(t.id)}
                      aria-label={`${t.title} 목록 찜 ${favorites.includes(t.id) ? "해제" : "추가"}`}
                      aria-pressed={favorites.includes(t.id)}
                    >
                      <Heart
                        size={17}
                        fill={
                          favorites.includes(t.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                    <button
                      className="icon-button add-queue"
                      onClick={() => addQueue(t.id)}
                      aria-label={`${t.title} 재생목록 추가`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <footer className="site-footer">
          <NavLink className="footer-wordmark" to="/">
            오프비트
          </NavLink>
          <p>
            © {new Date().getFullYear()} 오프비트 · 자체 제작 데모 음원
            <br />
            가상 아티스트와 자체 제작 데모 음원으로 구성한 포트폴리오입니다.
          </p>
          <button
            className="footer-top-button"
            aria-label="페이지 맨 위로 이동"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            맨 위로
          </button>
        </footer>
      </main>
      {queueOpen && (
        <>
          <div className="queue-scrim" onClick={() => setQueueOpen(false)} />
          <aside className="queue-panel" aria-label="재생목록">
            <div className="queue-heading">
              <div className="eyebrow">다음으로 들을 음악</div>
              <button
                className="icon-button"
                aria-label="재생목록 닫기"
                onClick={() => setQueueOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            <h2>
              나의 재생목록<span>{queue.length}</span>
            </h2>
            <p>다음으로 듣고 싶은 음악을 골라보세요.</p>
            <div className="queue-items">
              {queue.map((id) => {
                const t = tracks.find((v) => v.id === id);
                return (
                  <div
                    className={`queue-item ${currentId === id ? "is-current" : ""}`}
                    key={id}
                  >
                    <button
                      className="queue-track"
                      onClick={() => playTrack(id)}
                    >
                      <img src={cover(t)} alt="" />
                      <span>
                        <strong>{t.title}</strong>
                        <small>{t.artist}</small>
                      </span>
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`${t.title} 재생목록 삭제`}
                      onClick={() =>
                        setQueue((prev) => prev.filter((v) => v !== id))
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
              {!queue.length && (
                <div className="empty-queue">
                  <ListMusic size={35} />
                  <p>
                    재생목록이 비어 있어요.
                    <br />곡 옆 + 버튼으로 추가해 주세요.
                  </p>
                  <button
                    className="button"
                    onClick={() => setQueue(tracks.map((t) => t.id))}
                  >
                    전체 곡 추가
                  </button>
                </div>
              )}
            </div>
            <div className="queue-note">
              <Volume2 size={15} />{" "}
              {playing
                ? `재생 중 · ${current.title}`
                : "듣고 싶은 순간, 재생을 눌러주세요."}
            </div>
          </aside>
        </>
      )}
      <Player
        track={current}
        playing={playing}
        togglePlay={togglePlay}
        next={next}
        previous={previous}
        progress={progress}
        duration={duration}
        seek={seek}
        volume={volume}
        setVolume={changeVolume}
        shuffle={shuffle}
        setShuffle={setShuffle}
        repeat={repeat}
        setRepeat={setRepeat}
        liked={favorites.includes(currentId)}
        toggleLike={toggleLike}
        queueOpen={queueOpen}
        setQueueOpen={setQueueOpen}
        expanded={expanded}
        setExpanded={setExpanded}
      />
      <div className={`toast ${notice ? "show" : ""}`} role="status">
        {notice}
      </div>
    </div>
  );
}
