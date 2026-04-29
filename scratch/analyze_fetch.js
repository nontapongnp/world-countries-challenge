import topojson from "topojson-client";

async function analyze() {
  const response = await fetch(
    "https://unpkg.com/world-atlas@2.0.2/countries-50m.json",
  );
  const worldData = await response.json();
  const geojson = topojson.feature(worldData, worldData.objects.countries);
  const features = geojson.features;

  console.log(`Total features: ${features.length}`);
  console.log(
    "Sample Properties:",
    JSON.stringify(features[0].properties, null, 2),
  );

  // Count how many have specific types if available
  // Note: world-atlas often strips many properties.
  // If it only has 'name', I'll have to use a different source or a manual list.
}
analyze();
