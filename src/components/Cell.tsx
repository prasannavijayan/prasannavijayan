import type { Dot } from "@/types";

type CellProps = {
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
  dotInfo,
  isInPath,
  isHead,
  isConnectedDot,
  connectTop,
  connectBottom,
  connectLeft,
  connectRight,
}: CellProps) {
  const hasConnector = connectTop || connectBottom || connectLeft || connectRight;

  return (
    <div
      className={`
        relative flex items-center justify-center aspect-square
        rounded-sm border border-slate-700/50 transition-colors duration-100
        ${isInPath ? "bg-path/20" : "bg-surface"}
        ${isHead ? "bg-path/40 ring-2 ring-path ring-inset" : ""}
      `}
    >
      {/* Path connectors */}
      {hasConnector && isInPath && (
        <>
          {connectTop && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-1/2 bg-path/30 rounded-sm" />
          )}
          {connectBottom && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-1/2 bg-path/30 rounded-sm" />
          )}
          {connectLeft && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-2/5 bg-path/30 rounded-sm" />
          )}
          {connectRight && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-2/5 bg-path/30 rounded-sm" />
          )}
        </>
      )}

      {/* Dot */}
      {dotInfo && (
        <div
          className={`
            relative z-10 flex items-center justify-center
            w-3/5 h-3/5 rounded-full font-bold text-white text-sm
            transition-colors duration-200 select-none
            ${isConnectedDot ? "bg-dot-connected shadow-lg shadow-dot-connected/30" : "bg-dot shadow-lg shadow-dot/30"}
          `}
        >
          {dotInfo.number}
        </div>
      )}

      {/* Path dot (non-numbered cells in path) */}
      {isInPath && !dotInfo && (
        <div className="relative z-10 w-1/4 h-1/4 rounded-full bg-path/60" />
      )}
    </div>
  );
}
