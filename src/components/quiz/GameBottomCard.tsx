import React from "react";
import { CheckCircle2 } from "lucide-react";
import { GameInput } from "./GameInput";

interface GameBottomCardProps {
  gameState: "idle" | "playing" | "gameover";
  score: number;
  totalCountries: number;
  feedback: { type: "success"; message: string } | null;
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  startGame: () => void;
  isPaused: boolean;
}

export const GameBottomCard: React.FC<GameBottomCardProps> = ({
  gameState,
  score,
  totalCountries,
  feedback,
  inputValue,
  handleInputChange,
  inputRef,
  startGame,
  isPaused,
}) => {
  return (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4 md:px-6 pointer-events-none">
      {feedback && (
        <div className="mb-3 flex justify-center pointer-events-none">
          <div className="px-6 md:px-8 py-3 md:py-4 rounded-2xl border bg-black/50 border-green-500/30 backdrop-blur-3xl shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <CheckCircle2
              size={20}
              className="text-green-500 md:w-[22px] md:h-[22px]"
            />
            <span className="font-black text-base md:text-lg text-green-400 tracking-tight">
              {feedback.message}
            </span>
          </div>
        </div>
      )}
      <div className="bg-zinc-900/70 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-2xl flex flex-col items-center gap-4 pointer-events-auto transition-all duration-500">
        {gameState === "playing" ? (
          <GameInput
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            inputRef={inputRef}
            isPaused={isPaused}
          />
        ) : gameState === "idle" ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={startGame}
              className="group relative px-10 py-4 md:px-16 md:py-5 bg-white text-black font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-[0_20px_50px_rgba(255,255,255,0.1)] text-sm md:text-base w-full md:w-auto"
            >
              <span className="relative z-10">Start Challenge</span>
              <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">
              Identify all {totalCountries} countries to complete the mission.
            </p>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-500">
            <h3 className="text-3xl md:text-4xl font-black text-red-500 mb-2 uppercase tracking-tighter">
              Mission Terminated
            </h3>
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
              <div className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest">
                Countries Found:{" "}
                <span className="text-white text-xl md:text-2xl ml-2">
                  {score}
                </span>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 md:px-10 md:py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all w-full md:w-auto"
            >
              Re-attempt Mission
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
