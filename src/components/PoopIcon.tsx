export default function PoopIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pile of poo - CC0 */}
      <path d="M32 4c-2 0-4 3-2 6 1 2 0 4-2 5-3 1-5 4-4 7 0 1-1 2-3 3-3 1-5 4-5 7s2 6 5 7c-4 2-7 6-7 11 0 7 8 12 18 12s18-5 18-12c0-5-3-9-7-11 3-1 5-4 5-7s-2-6-5-7c-2-1-3-2-3-3 1-3-1-6-4-7-2-1-3-3-2-5 2-3 0-6-2-6z" fill="#8B6914"/>
      <path d="M32 8c-1 0-2 2-1 4 1 2 0 5-3 6-2 1-4 3-3 6 0 2 1 3 3 3 1 0 2-1 2-2 0-2 2-3 3-3 2 0 3 1 3 3 0 1 1 2 2 2 2 0 3-1 3-3 1-3-1-5-3-6-3-1-4-4-3-6 1-2 0-4-1-4z" fill="#A67C00" opacity="0.5"/>
      <ellipse cx="25" cy="42" rx="3" ry="3.5" fill="#1a1a2e"/>
      <ellipse cx="39" cy="42" rx="3" ry="3.5" fill="#1a1a2e"/>
      <ellipse cx="25" cy="41.5" rx="1.5" ry="1.5" fill="white"/>
      <ellipse cx="39" cy="41.5" rx="1.5" ry="1.5" fill="white"/>
      <path d="M28 49c0 0 2 3 4 3s4-3 4-3" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
