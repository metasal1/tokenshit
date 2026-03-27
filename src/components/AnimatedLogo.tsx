export default function AnimatedLogo({ size = "hero" }: { size?: "hero" | "nav" }) {
  const isHero = size === "hero";
  const sizeClass = isHero
    ? "text-5xl sm:text-6xl md:text-8xl"
    : "text-2xl";

  return (
    <span className={`${sizeClass} whitespace-nowrap font-monoton`}>
      <span className="neon-text">TOKEN</span>
      <span className="neon-dollar">$</span>
      <span className="neon-text">HIT</span>
      {isHero && <span className="inline-block ml-3 text-5xl">💩</span>}
    </span>
  );
}
