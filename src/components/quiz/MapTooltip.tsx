import React from "react";
import { CountryFeature } from "./types";

interface MapTooltipProps {
  hoveredCountry: CountryFeature | null;
  gameState: "idle" | "playing" | "gameover";
  correctIds: Set<string | number>;
  mousePos: { x: number; y: number };
  hideTooltipTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
  setHoveredCountry: React.Dispatch<React.SetStateAction<CountryFeature | null>>;
  activeHints: Record<string, string>;
  hintsLeft: number;
  setHintsLeft: React.Dispatch<React.SetStateAction<number>>;
  setActiveHints: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  scrambleName: (name: string) => string;
}

export const MapTooltip: React.FC<MapTooltipProps> = ({
  hoveredCountry,
  gameState,
  correctIds,
  mousePos,
  hideTooltipTimeout,
  setHoveredCountry,
  activeHints,
  hintsLeft,
  setHintsLeft,
  setActiveHints,
  scrambleName,
}) => {
  if (!hoveredCountry || gameState !== "playing" || correctIds.has(hoveredCountry.id!)) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => {
        if (hideTooltipTimeout.current) clearTimeout(hideTooltipTimeout.current);
      }}
      onMouseLeave={() => {
        hideTooltipTimeout.current = setTimeout(() => {
          setHoveredCountry(null);
        }, 150);
      }}
      className="fixed z-[100] px-4 py-3 bg-sky-900/80 backdrop-blur-md border border-sky-400/30 rounded-xl text-xs font-bold uppercase tracking-widest pointer-events-auto animate-in fade-in zoom-in duration-200 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
      style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center gap-4">
          <span className="text-sky-300 text-[10px] font-black tracking-[0.2em]">
            Satellite Hint
          </span>
          <span className="text-[9px] text-white/50 bg-black/30 px-1.5 py-0.5 rounded">
            {hoveredCountry.properties.name.length} Chars
          </span>
        </div>
        
        {activeHints[hoveredCountry.id!] ? (
          <div className="text-yellow-300 text-sm tracking-widest text-center py-1">
            {activeHints[hoveredCountry.id!]}
          </div>
        ) : (
          hintsLeft > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHintsLeft((prev) => prev - 1);
                setActiveHints((prev) => ({
                  ...prev,
                  [hoveredCountry.id!]: scrambleName(hoveredCountry.properties.name)
                }));
              }}
              className="mt-1 px-3 py-2 bg-sky-500/20 hover:bg-sky-500/40 text-sky-100 rounded-lg text-[10px] transition-colors border border-sky-500/30 active:scale-95"
            >
              Use Hint ({hintsLeft} left)
            </button>
          )
        )}
      </div>
    </div>
  );
};
