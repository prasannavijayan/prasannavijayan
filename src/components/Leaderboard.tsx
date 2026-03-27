import { useLeaderboard } from "@/hooks/useLeaderboard";
import { formatTime } from "@/hooks/useTimer";

type LeaderboardProps = {
  level: number;
  currentUid: string;
  onClose: () => void;
};

export function Leaderboard({ level, currentUid, onClose }: LeaderboardProps) {
  const { data: entries, isLoading, error } = useLeaderboard(level, true);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface border border-slate-600 rounded-2xl p-6 max-w-sm w-full mx-4 animate-slide-to-center">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            🏆 Level {level} Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-path border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center py-4">
            Failed to load leaderboard
          </p>
        )}

        {entries && entries.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">
            No scores yet. Be the first!
          </p>
        )}

        {entries && entries.length > 0 && (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {/* Header */}
            <div className="grid grid-cols-[2rem_1fr_4rem] gap-2 px-2 py-1 text-text-muted text-xs uppercase tracking-wider">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Time</span>
            </div>

            {entries.map((entry, i) => {
              const isMe = entry.uid === currentUid;
              const medal =
                i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

              return (
                <div
                  key={entry.uid}
                  className={`grid grid-cols-[2rem_1fr_4rem] gap-2 px-2 py-2 rounded-lg text-sm ${
                    isMe
                      ? "bg-path/20 border border-path/30"
                      : "hover:bg-slate-700/40"
                  }`}
                >
                  <span className="text-text-muted">
                    {medal ?? i + 1}
                  </span>
                  <span
                    className={`truncate ${isMe ? "text-path font-semibold" : "text-white"}`}
                  >
                    {entry.displayName}
                    {isMe && (
                      <span className="text-xs text-text-muted ml-1">
                        (you)
                      </span>
                    )}
                  </span>
                  <span className="text-right font-mono tabular-nums text-text-muted">
                    {formatTime(entry.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
