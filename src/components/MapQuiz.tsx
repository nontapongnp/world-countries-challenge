"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {
  Trophy,
  RotateCcw,
  Globe as GlobeIcon,
  Map as MapIcon,
  Timer,
  Search,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import { Feature, Geometry } from "geojson";

interface CountryProperties {
  name: string;
  continent?: string;
}

type CountryFeature = Feature<Geometry, CountryProperties>;

const COUNTRY_ALIASES: Record<string, string[]> = {
  "United States of America": ["usa", "united states", "america", "us"],
  "United Kingdom": ["uk", "britain", "england", "great britain"],
  "United Arab Emirates": ["uae", "emirates"],
  "Dem. Rep. Congo": [
    "drc",
    "congo kinshasa",
    "democratic republic of the congo",
    "zaire",
  ],
  Congo: ["republic of the congo", "congo brazzaville"],
  "South Korea": ["korea", "republic of korea", "korea south"],
  "North Korea": [
    "dprk",
    "korea north",
    "democratic people's republic of korea",
  ],
  "Central African Rep.": ["car", "central african republic"],
  "Dominican Rep.": ["dominican republic"],
  "South Sudan": ["sudan south", "s. sudan"],
  "Solomon Is.": ["solomon islands"],
  "Falkland Is.": ["falkland islands"],
  "S. Geo. and S. Sandw. Is.": ["south georgia"],
  "Fr. S. Antarctic Lands": ["french southern antarctic lands"],
  "Eq. Guinea": ["equatorial guinea"],
  "Bosnia and Herz.": ["bosnia", "bosnia and herzegovina"],
  "Côte d'Ivoire": ["ivory coast", "cote d'ivoire"],
  Myanmar: ["burma"],
  Taiwan: ["republic of china"],
  Vatican: ["vatican city", "holy see"],
  Palestine: ["state of palestine"],
  eSwatini: ["swaziland"],
};

// Comprehensive list of territories to exclude to reach exactly 195 sovereign states
// Note: Natural Earth 50m data names vary slightly from UN standard names.
const EXCLUDED_TERRITORIES = new Set([
  "Antarctica",
  "French Guiana",
  "Puerto Rico",
  "French Southern Antarctic Lands",
  "Falkland Is.",
  "S. Geo. and S. Sandw. Is.",
  "New Caledonia",
  "Western Sahara",
  "Somaliland",
  "Northern Cyprus",
  "Kosovo",
  "Aruba",
  "Curacao",
  "Sint Maarten",
  "Hong Kong",
  "Macao",
  "Guam",
  "American Samoa",
  "Cook Is.",
  "Niue",
  "Anguilla",
  "Bermuda",
  "British Virgin Is.",
  "Cayman Is.",
  "Montserrat",
  "Turks and Caicos Is.",
  "Saint Pierre and Miquelon",
  "Wallis and Futuna Is.",
  "Saint Martin",
  "Saint Barthelemy",
  "Guadeloupe",
  "Martinique",
  "Mayotte",
  "Reunion",
  "French Polynesia",
  "Jersey",
  "Guernsey",
  "Isle of Man",
  "Faroe Is.",
  "Gibraltar",
  "British Indian Ocean Ter.",
  "Saint Helena",
  "U.S. Virgin Is.",
  "W. Sahara",
  "Åland",
  "St-Barthélemy",
  "St-Martin",
  "S. Geo. and the Is.",
  "Heard I. and McDonald Is.",
  "Siachen Glacier",
  "Fr. Polynesia",
  "St. Pierre and Miquelon",
  "Indian Ocean Ter.",
  "Pitcairn Is.",
  "Norfolk Island",
  "Christmas Island",
  "Cocos Islands",
  "Tokelau",
  "Northern Mariana Is.",
  "United States Minor Outlying Islands",
  "Bougainville",
  "Chuuk",
  "Easter Island",
  "N. Cyprus",
  "N. Mariana Is.",
  "Heard and McDonald Is.",
  "Taiwan",
  "Somaliland",
  "S. Geo. and the Is.",
  "Siachen Glacier",
  "W. Sahara",
]);

// Territories that are shown on the map but answered under their parent country.
// key = territory name in TopoJSON, value = sovereign country name to type.
const TERRITORY_PARENTS: Record<string, string> = {
  Greenland: "Denmark",
};

const MapQuiz = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "success";
    message: string;
  } | null>(null);
  const [correctIds, setCorrectIds] = useState<Set<string | number>>(new Set());
  const [isGlobe, setIsGlobe] = useState(false);
  const [initialTime, setInitialTime] = useState(1200); // 20 minutes default
  const [timeLeft, setTimeLeft] = useState(1200);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle",
  );
  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(
    null,
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Countries the player actually needs to guess (excludes display-only territories)
  const sovereignCountries = useMemo(
    () => countries.filter((c) => !TERRITORY_PARENTS[c.properties.name]),
    [countries],
  );

  // Map: parent name → list of territory features
  const territoriesOf = useMemo(() => {
    const map: Record<string, CountryFeature[]> = {};
    countries.forEach((c) => {
      const parent = TERRITORY_PARENTS[c.properties.name];
      if (parent) {
        if (!map[parent]) map[parent] = [];
        map[parent].push(c);
      }
    });
    return map;
  }, [countries]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          "https://unpkg.com/world-atlas@2.0.2/countries-50m.json",
        );
        const worldData = await response.json();
        const geojson = topojson.feature(
          worldData,
          worldData.objects.countries,
        ) as any;
        const features = geojson.features as CountryFeature[];

        // Filter to reach exactly 195 sovereign countries (UN 193 + 2)
        const filtered = features.filter((c) => {
          const name = c.properties.name;
          return name && !EXCLUDED_TERRITORIES.has(name);
        });

        // To ensure exactly 195, we can slice if we are slightly over or just use the filtered list if it's correct.
        // For now, let's use the filtered list and see.
        setCountries(filtered);
      } catch (error) {
        console.error("Error loading map data:", error);
      }
    };
    loadData();
  }, []);

  const startGame = () => {
    setScore(0);
    setCorrectIds(new Set());
    setFeedback(null);
    setGameState("playing");
    setTimeLeft(initialTime);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const adjustTime = (deltaMinutes: number) => {
    setInitialTime((prev) => {
      const next = Math.min(60 * 60, Math.max(60, prev + deltaMinutes * 60));
      if (gameState === "playing")
        setTimeLeft((t) =>
          Math.min(60 * 60, Math.max(0, t + deltaMinutes * 60)),
        );
      return next;
    });
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (gameState !== "playing") return;

    const normalizedInput = val.trim().toLowerCase();
    if (normalizedInput.length < 2) return;

    // Only match sovereign countries (territories light up automatically)
    const matchedCountry = sovereignCountries.find((c) => {
      if (c.id !== undefined && correctIds.has(c.id)) return false;

      const officialName = c.properties.name.toLowerCase();
      if (officialName === normalizedInput) return true;

      const aliases = COUNTRY_ALIASES[c.properties.name];
      if (
        aliases &&
        aliases.map((a) => a.toLowerCase()).includes(normalizedInput)
      )
        return true;

      return false;
    });

    if (matchedCountry && matchedCountry.id !== undefined) {
      const newScore = score + 1;
      setScore(newScore);
      setCorrectIds((prev) => {
        const next = new Set(prev);
        next.add(matchedCountry.id!);
        // Also light up linked territories (e.g. Greenland when Denmark is typed)
        const linked = territoriesOf[matchedCountry.properties.name] ?? [];
        linked.forEach((t) => {
          if (t.id !== undefined) next.add(t.id);
        });
        if (newScore === sovereignCountries.length) {
          setGameState("gameover");
        }
        return next;
      });
      setInputValue("");
      setFeedback({
        type: "success",
        message: `Identified: ${matchedCountry.properties.name}`,
      });
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  useEffect(() => {
    if (!svgRef.current || countries.length === 0) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const radialGradient = defs
      .append("radialGradient")
      .attr("id", "ocean-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    radialGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#178ca3ff"); // Slightly lighter center
    radialGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#197485ff"); // Target color

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#ocean-gradient)");

    // Removed stars as the background is now light blue

    const projection = isGlobe
      ? d3
          .geoOrthographic()
          .scale(Math.min(width, height) / 2.5)
          .translate([width / 2, height / 2])
          .rotate([0, 0])
      : d3
          .geoNaturalEarth1()
          .scale(width / 5.5)
          .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);
    const g = svg.append("g").attr("class", "map-layer");

    if (!isGlobe) {
      g.attr("transform", transformRef.current.toString());
    }

    if (isGlobe) {
      g.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale())
        .attr("fill", "#F4EFE3") // Match the unanswered land color for the globe base
        .attr("stroke", "rgba(0,0,0,0.1)")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0 0 15px rgba(0,0,0,0.05))");
    }

    g.selectAll<SVGPathElement, CountryFeature>("path.country")
      .data(countries)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("id", (d) => `country-${d.id}`)
      .attr("d", path)
      .attr("fill", (d) =>
        d.id !== undefined && correctIds.has(d.id) ? "#92E1BE" : "#F4EFE3",
      )
      .attr("stroke", "rgba(0,0,0,0.1)")
      .attr("stroke-width", 0.3)
      .style("transition", "fill 0.4s ease, opacity 0.2s ease")
      .on("mouseover", function (event, d) {
        setHoveredCountry(d);
        // d3.select(this)
        //   .attr("opacity", 0.8)
        //   .attr("stroke", "rgba(255,255,255,0.5)");
      })
      .on("mousemove", (event) => {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on("mouseout", function () {
        setHoveredCountry(null);
        // d3.select(this)
        //   .attr("opacity", 1)
        //   .attr("stroke", "rgba(255,255,255,0.5)");
      });

    if (!isGlobe) {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 15])
        .on("zoom", (event) => {
          transformRef.current = event.transform;
          g.attr("transform", event.transform);
        });
      svg.call(zoom);
      svg.call(zoom.transform, transformRef.current);
    } else {
      const drag = d3.drag<SVGSVGElement, unknown>().on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 75 / projection.scale();
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        g.selectAll<SVGPathElement, CountryFeature>("path.country").attr(
          "d",
          path,
        );
      });
      svg.call(drag);
    }
  }, [countries, isGlobe, gameState]);

  useEffect(() => {
    if (!svgRef.current) return;
    const g = d3.select(svgRef.current).select<SVGGElement>("g.map-layer");
    g.selectAll<SVGPathElement, CountryFeature>("path.country")
      .transition()
      .duration(400)
      .attr("fill", (d) =>
        d.id !== undefined && correctIds.has(d.id) ? "#23d485ff" : "#e4dfd5ff",
      );
  }, [correctIds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full noto-sans h-screen overflow-hidden bg-[#71D3E5] text-white select-none">
      <div className="absolute inset-0 pointer-events-none">
        {/* Stars removed for light background visibility */}
      </div>

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
                      / {sovereignCountries.length}
                    </span>
                  </span>
                </div>
                <span className="text-[8px] md:text-[9px] uppercase font-black tracking-widest mt-1">
                  Countries Found
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center gap-2 ${timeLeft < 60 ? "text-red-500 animate-bounce" : "text-white"}`}
                >
                  <Timer size={18} className="md:w-[20px] md:h-[20px]" />
                  <span className="text-2xl md:text-3xl font-black">
                    {formatTime(
                      gameState === "playing" ? timeLeft : initialTime,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => adjustTime(-1)}
                    disabled={initialTime <= 60}
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="-1 minute"
                  >
                    <Minus size={13} />
                  </button>
                  {/* <span className="text-[9px] uppercase font-black tracking-widest px-1">
                    {Math.floor(initialTime / 60)}m
                  </span> */}
                  <button
                    onClick={() => adjustTime(1)}
                    disabled={initialTime >= 3600}
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="+1 minute"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
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

      {/* Bottom card: start / input / gameover */}
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
            <div className="relative group w-full animate-in slide-in-from-bottom-2 duration-300">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 w-[20px] md:w-[24px]" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a country name..."
                className="w-full bg-black/40 border-2 border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-16 pr-4 md:pr-6 text-xl md:text-2xl font-bold placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all shadow-inner"
                autoComplete="off"
              />
            </div>
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
                Identify all {sovereignCountries.length} countries to complete
                the mission.
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

      <svg
        ref={svgRef}
        className={`w-full h-full cursor-grab active:cursor-grabbing touch-none transition-all duration-1000 ${gameState !== "playing" ? "blur-md scale-110 opacity-30" : ""}`}
      />

      <div className="hidden md:block absolute bottom-8 right-8 text-[10px] font-black uppercase tracking-[0.3em] bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/5 shadow-2xl pointer-events-none">
        {isGlobe ? "Drag Globe to Rotate" : "Scroll to Zoom • Drag to Explore"}
      </div>

      {hoveredCountry &&
        gameState === "playing" &&
        !correctIds.has(hoveredCountry.id!) && (
          <div
            className="fixed z-[100] px-4 py-2 bg-sky-900/40 backdrop-blur-md border border-sky-400/30 rounded-lg text-xs font-bold uppercase tracking-widest pointer-events-none animate-in fade-in zoom-in duration-200 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
            style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sky-300 text-[10px] font-black tracking-[0.2em] mb-1">
                Satellite Hint
              </span>
              <span className="text-white mt-1">
                {hoveredCountry.properties.name.length} Characters
              </span>
            </div>
          </div>
        )}

      <style jsx>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(1px 1px at 20px 30px, #eee, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0, 0, 0, 0)),
            radial-gradient(1.5px 1.5px at 90px 40px, #fff, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 160px 120px, #ddd, rgba(0, 0, 0, 0));
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.3;
          animation: stars-shift 120s linear infinite;
        }
        @keyframes stars-shift {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-200px);
          }
        }
      `}</style>
    </div>
  );
};

export default MapQuiz;
