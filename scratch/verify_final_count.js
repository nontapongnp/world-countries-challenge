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
  // "Hong Kong",
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
  "Niue",
  "Cook Is.",
  "Bougainville",
  "Chuuk",
  "Easter Island",
]);

async function verify() {
  const response = await fetch(
    "https://unpkg.com/world-atlas@2.0.2/countries-50m.json",
  );
  const worldData = await response.json();
  const geojson = feature(worldData, worldData.objects.countries);
  const features = geojson.features;

  const valid = features.filter((c) => {
    const name = c.properties.name;
    return name && !EXCLUDED_TERRITORIES.has(name);
  });

  console.log(`Final Filtered Count: ${valid.length}`);
}
verify();
