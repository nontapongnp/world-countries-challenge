import React from "react";
import { Timer, Plus, Minus, Pause, Play } from "lucide-react";

interface TimerDisplayProps {
  gameState: "idle" | "playing" | "gameover";
  timeLeft: number;
  initialTime: number;
  adjustTime: (deltaMinutes: number) => void;
  formatTime: (seconds: number) => string;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  gameState,
  timeLeft,
  initialTime,
  adjustTime,
  formatTime,
  isPaused,
  setIsPaused,
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center gap-2 ${timeLeft < 60 ? "text-red-500 animate-bounce" : "text-white"}`}
      >
        <Timer size={18} className="md:w-[20px] md:h-[20px]" />
        <span className="text-2xl md:text-3xl font-black">
          {formatTime(gameState === "playing" ? timeLeft : initialTime)}
        </span>
        {gameState === "playing" && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={14} className="ml-0.5" /> : <Pause size={14} />}
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <button
          onClick={() => adjustTime(-1)}
          disabled={initialTime <= 60 || gameState !== "idle"}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="-1 minute"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={() => adjustTime(1)}
          disabled={initialTime >= 3600 || gameState !== "idle"}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="+1 minute"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};
