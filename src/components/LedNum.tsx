/** 7-segment LED digits. Letters / units stay in the parent face. */
export function LedNum({
  children,
  className = "",
}: {
  children: string | number | null | undefined;
  className?: string;
}) {
  if (children == null || children === "") return null;
  const text = String(children);
  return (
    <span className={className}>
      {text.split(/(\d[\d.,]*)/).map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="font-led tracking-tight">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
