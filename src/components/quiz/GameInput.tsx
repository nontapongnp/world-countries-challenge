import React from "react";
import { Search } from "lucide-react";

interface GameInputProps {
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isPaused: boolean;
}

export const GameInput: React.FC<GameInputProps> = ({
  inputValue,
  handleInputChange,
  inputRef,
  isPaused,
}) => {
  return (
    <div className="relative group w-full animate-in slide-in-from-bottom-2 duration-300">
      <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 w-[20px] md:w-[24px]" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        disabled={isPaused}
        placeholder={isPaused ? "Game Paused..." : "Type a country name..."}
        className={`w-full bg-black/40 border-2 border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-16 pr-4 md:pr-6 text-xl md:text-2xl font-bold placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all shadow-inner ${isPaused ? "opacity-50 cursor-not-allowed" : ""}`}
        autoComplete="off"
      />
    </div>
  );
};
