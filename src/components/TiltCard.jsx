import { useRef } from "react";

export default function TiltCard({ children }) {
  const card = useRef(null);
  const move = (event) => {
    if (
      event.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const rect = card.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    const y = Math.max(
      0,
      Math.min(1, (event.clientY - rect.top) / rect.height),
    );
    card.current.style.setProperty("--tilt-x", `${(0.5 - y) * 12}deg`);
    card.current.style.setProperty("--tilt-y", `${(x - 0.5) * 14}deg`);
    card.current.style.setProperty("--light-x", `${x * 100}%`);
    card.current.style.setProperty("--light-y", `${y * 100}%`);
  };
  const reset = () => {
    ["--tilt-x", "--tilt-y", "--light-x", "--light-y"].forEach((key) =>
      card.current.style.removeProperty(key),
    );
  };
  return (
    <article
      className="album-card"
      ref={card}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      {children}
    </article>
  );
}
