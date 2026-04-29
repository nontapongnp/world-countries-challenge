import { feature } from "topojson-client";
const EXCLUDED_TERRITORIES = new Set([
  "Antarctica",
  "Greenland",
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
]);

async function verify() {
  const response = await fetch(
    "https://unpkg.com/world-atlas@2.0.2/countries-50m.json",
  );
  const worldData = await response.json();
  const geojson = feature(worldData, worldData.objects.countries);
  const features = geojson.features;

  const validCountries = features.filter((c) => {
    const name = c.properties.name;
    return name && !EXCLUDED_TERRITORIES.has(name);
  });

  console.log(`Filtered Count: ${validCountries.length}`);

  // If count is not 195, we might need to add more exclusions or check why.
  // Common 195: 193 UN + Vatican + Palestine.
}
verify();
