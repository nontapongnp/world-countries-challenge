import { Feature, Geometry } from "geojson";

export interface CountryProperties {
  name: string;
  continent?: string;
}

export type CountryFeature = Feature<Geometry, CountryProperties>;
