import type { Dot } from "@/types";

type CellProps = {
  isWall: boolean;
  dotInfo: Dot | undefined;
  isInPath: boolean;
  isHead: boolean;
  isConnectedDot: boolean;
  pathIndex: number;
  totalPathLength: number;
  connectTop: boolean;
  connectBottom: boolean;
  connectLeft: boolean;
  connectRight: boolean;
};

export function Cell({
  isWall,
  dotInfo,
  isInPath,
  isHead,
  isConnectedDot,
  connectTop,
  connectBottom,
  connectLeft,
  connectRight,
}: CellProps) {
  // Wall cell — solid dark block, no interaction
  if (isWall) {
    return (
      <div className="relative flex items-center justify-center aspect-square">
        <div className="absolute inset-0 bg-slate-700 rounded-sm" />
        {/* subtle cross-hatch texture */}
        <div
          className="absolute inset-0 rounded-sm opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)",
          }}
        />
      </div>
    );
  }

  // Determine border radius: round only the exposed (non-connected) corners
  const tl = !connectTop && !connectLeft ? "6px" : "0";
  const tr = !connectTop && !connectRight ? "6px" : "0";
  const bl = !connectBottom && !connectLeft ? "6px" : "0";
  const br = !connectBottom && !connectRight ? "6px" : "0";
  const borderRadius = `${tl} ${tr} ${br} ${bl}`;

  return (
    <div className="relative flex items-center justify-center aspect-square">
      {/* Path fill */}
      {isInPath && (
        <div
          className={`absolute transition-colors duration-100 ${
            isHead ? "bg-path/50" : "bg-path/30"
          }`}
          style={{
            top: connectTop ? "-1px" : "2px",
            bottom: connectBottom ? "-1px" : "2px",
            left: connectLeft ? "-1px" : "2px",
            right: connectRight ? "-1px" : "2px",
            borderRadius,
          }}
        />
      )}

      {/* Empty cell border */}
      {!isInPath && (
        <div className="absolute inset-[1px] rounded border border-slate-700/40" />
      )}

      {/* Dot (numbered) */}
      {dotInfo && (
        <div
          className={`
            relative z-10 flex items-center justify-center
            w-3/5 h-3/5 rounded-full font-bold text-white text-sm
            transition-all duration-200 select-none
            ${
              isConnectedDot
                ? "bg-dot-connected shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "bg-dot shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            }
          `}
        >
          {dotInfo.number}
        </div>
      )}

      {/* Head indicator — pulsing dot (non-dot cell) */}
      {isHead && !dotInfo && (
        <div
          className="relative z-10 w-1/3 h-1/3 rounded-full bg-path-light/80"
          style={{ animation: "head-pulse 1.2s ease-in-out infinite" }}
        />
      )}

      {/* Head indicator — ring around dot */}
      {isHead && dotInfo && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            className="w-4/5 h-4/5 rounded-full border-2 border-path-light"
            style={{ animation: "head-pulse 1.2s ease-in-out infinite" }}
          />
        </div>
      )}
    </div>
  );
}
