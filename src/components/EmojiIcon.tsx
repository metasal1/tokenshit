/** Noto Color Emoji UI glyph — use instead of Lucide for fun chrome. */
export function EmojiIcon({
  children,
  className = "",
  size,
  label,
}: {
  children: string;
  className?: string;
  /** px number or CSS size */
  size?: number | string;
  label?: string;
}) {
  const fontSize =
    size == null
      ? undefined
      : typeof size === "number"
        ? `${size}px`
        : size;
  return (
    <span
      className={`emoji inline-flex shrink-0 items-center justify-center leading-none select-none ${className}`}
      style={fontSize ? { fontSize, lineHeight: 1 } : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  );
}
