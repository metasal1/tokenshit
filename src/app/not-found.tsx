import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-[120px] sm:text-[180px] leading-none mb-2 select-none animate-bounce">
        💩
      </div>
      <h1 className="text-4xl sm:text-6xl font-monoton mb-4">
        <span className="neon-text">4</span>
        <span className="neon-dollar">0</span>
        <span className="neon-text">4</span>
      </h1>
      <p className="text-xl sm:text-2xl text-zinc-400 mb-2">
        This token doesn&apos;t exist.
      </p>
      <p className="text-zinc-600 mb-8 max-w-md">
        Either it got rugged, the dev disappeared, or you typed the wrong URL.
        <br />
        Honestly, all three are equally likely.
      </p>
      <Link
        href="/"
        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        Back to the Shitshow
      </Link>
      <p className="mt-8 text-xs text-zinc-700 font-mono">
        error: TOKEN_NOT_FOUND — certified $HIT
      </p>
    </div>
  );
}
