export enum Granularity {
  Raw = "raw",
  Hourly = "hourly",
  LifeTime = "life-time",
}

/**
 * Model for data in API request made for getting noise measurements.
 */
export type NoiseRequestParams = {
  granularity?: Granularity;
  start?: Date;
  end?: Date;
  page?: number;
};

/**
 * Single location type.
 */
export type Location = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
  latestTimestamp: string;
};

/**
 * Locations data type.
 */
export type LocationsData = {
  locations: Location[];
};
