import { readFileSync } from "fs";
import { feature } from "topojson-client";

try {
  const worldData = JSON.parse(readFileSync("countries-50m.json", "utf8"));
  const geojson = feature(worldData, worldData.objects.countries);
  const features = geojson.features;

  console.log(`Total features: ${features.length}`);

  const named = features.filter(
    (f) => f.properties.name && f.properties.name !== "Antarctica",
  );
  console.log(`Named (excluding Antarctica): ${named.length}`);

  // List some names to see what we have
  // console.log(named.map(f => f.properties.name).sort().join(', '));
} catch (e) {
  console.error(e);
}
