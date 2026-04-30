"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { CountryFeature } from "./quiz/types";
import { GameHeader } from "./quiz/GameHeader";
import { GameBottomCard } from "./quiz/GameBottomCard";
import { MapTooltip } from "./quiz/MapTooltip";

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
  const hideTooltipTimeout = useRef<NodeJS.Timeout | null>(null);

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
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(
    null,
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hintsLeft, setHintsLeft] = useState(15);
  const [activeHints, setActiveHints] = useState<Record<string, string>>({});

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
    setHintsLeft(15);
    setActiveHints({});
    setIsPaused(false);
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
    if (gameState !== "playing" || isPaused) return;

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
  }, [gameState, isPaused]);

  useEffect(() => {
    if (!isPaused && gameState === "playing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isPaused, gameState]);

  const scrambleName = (name: string) => {
    return name
      .split(" ")
      .map((word) => {
        if (word.length <= 1) return word;
        let scrambled = word;
        let attempts = 0;
        while (scrambled === word && attempts < 5) {
          const chars = word.split("");
          for (let i = chars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]];
          }
          scrambled = chars.join("");
          attempts++;
        }
        return scrambled;
      })
      .join(" ");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (gameState !== "playing" || isPaused) return;

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

    svg.on(".zoom", null);
    svg.on(".drag", null);

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
        if (hideTooltipTimeout.current)
          clearTimeout(hideTooltipTimeout.current);
        setHoveredCountry(d);
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on("mousemove", (event) => {
        setMousePos((prev) => {
          const dist = Math.hypot(
            prev.x - event.clientX,
            prev.y - event.clientY,
          );
          // Only update tooltip position if mouse moved far enough
          // This allows the user to catch the tooltip to click the hint button
          if (dist > 40) return { x: event.clientX, y: event.clientY };
          return prev;
        });
      })
      .on("mouseout", function () {
        hideTooltipTimeout.current = setTimeout(() => {
          setHoveredCountry(null);
        }, 150);
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

      <GameHeader
        gameState={gameState}
        score={score}
        totalCountries={sovereignCountries.length}
        timeLeft={timeLeft}
        initialTime={initialTime}
        adjustTime={adjustTime}
        isGlobe={isGlobe}
        setIsGlobe={setIsGlobe}
        startGame={startGame}
        formatTime={formatTime}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
      />

      {/* Bottom card: start / input / gameover */}
      <GameBottomCard
        gameState={gameState}
        score={score}
        totalCountries={sovereignCountries.length}
        feedback={feedback}
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        inputRef={inputRef}
        startGame={startGame}
        isPaused={isPaused}
      />

      <svg
        ref={svgRef}
        className={`w-full h-full cursor-grab active:cursor-grabbing touch-none transition-all duration-1000 ${gameState !== "playing" ? "blur-md scale-110 opacity-30" : ""}`}
      />

      <div className="hidden md:block absolute bottom-8 right-8 text-[10px] font-black uppercase tracking-[0.3em] bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/5 shadow-2xl pointer-events-none">
        {isGlobe ? "Drag Globe to Rotate" : "Scroll to Zoom • Drag to Explore"}
      </div>

      <MapTooltip
        hoveredCountry={hoveredCountry}
        gameState={gameState}
        correctIds={correctIds}
        mousePos={mousePos}
        hideTooltipTimeout={hideTooltipTimeout}
        setHoveredCountry={setHoveredCountry}
        activeHints={activeHints}
        hintsLeft={hintsLeft}
        setHintsLeft={setHintsLeft}
        setActiveHints={setActiveHints}
        scrambleName={scrambleName}
      />

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
