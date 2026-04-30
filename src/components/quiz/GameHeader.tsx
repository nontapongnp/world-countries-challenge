import React from "react";
import { Trophy, Plus, Minus, Map as MapIcon, Globe as GlobeIcon, RotateCcw } from "lucide-react";
import { TimerDisplay } from "./TimerDisplay";

interface GameHeaderProps {
  gameState: "idle" | "playing" | "gameover";
  score: number;
  totalCountries: number;
  timeLeft: number;
  initialTime: number;
  adjustTime: (deltaMinutes: number) => void;
  isGlobe: boolean;
  setIsGlobe: (val: boolean) => void;
  startGame: () => void;
  formatTime: (seconds: number) => string;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  gameState,
  score,
  totalCountries,
  timeLeft,
  initialTime,
  adjustTime,
  isGlobe,
  setIsGlobe,
  startGame,
  formatTime,
  isPaused,
  setIsPaused,
}) => {
  return (
    <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-5xl px-4 md:px-6 pointer-events-none">
      <div className="bg-zinc-900/70 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 shadow-2xl flex flex-col items-center gap-4 md:gap-6 pointer-events-auto transition-all duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between w-full px-2 md:px-6 gap-4 md:gap-0">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
              <span
                className={`w-2 h-2 rounded-full ${gameState === "playing" ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`}
              />
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black">
                Global Knowledge Mission
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent tracking-tight">
              World Country Quiz
            </h2>
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 items-center justify-center w-full md:w-auto">
            <div className="flex flex-col items-center border-r border-white/10 pr-4 md:pr-8">
              <div className="flex items-center gap-2 text-blue-400">
                <Trophy
                  size={16}
                  className="drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] md:w-[18px] md:h-[18px]"
                />
                <span className="text-2xl md:text-3xl font-black">
                  {score}
                  <span className="text-sm md:text-lg ml-1">
                    / {totalCountries}
                  </span>
                </span>
              </div>
              <span className="text-[8px] md:text-[9px] uppercase font-black tracking-widest mt-1">
                Countries Found
              </span>
            </div>
            <TimerDisplay
              gameState={gameState}
              timeLeft={timeLeft}
              initialTime={initialTime}
              adjustTime={adjustTime}
              formatTime={formatTime}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
            />
            <div className="flex gap-2 w-full md:w-auto justify-center mt-2 md:mt-0">
              <button
                onClick={() => setIsGlobe(!isGlobe)}
                className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-lg"
              >
                {isGlobe ? (
                  <MapIcon size={18} className="md:w-[20px] md:h-[20px]" />
                ) : (
                  <GlobeIcon size={18} className="md:w-[20px] md:h-[20px]" />
                )}
              </button>
              <button
                onClick={startGame}
                className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group shadow-lg"
              >
                <RotateCcw
                  size={18}
                  className="text-zinc-400 group-hover:rotate-180 transition-transform duration-700 md:w-[20px] md:h-[20px]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
