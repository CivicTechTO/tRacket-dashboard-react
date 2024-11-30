export type HTTP_METHODS = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export enum Granularity {
  Raw = 'raw',
  Hourly = 'hourly',
  LifeTime = 'life-time',
}

/**
 * Model for data in API request made for getting noise measurements.
 */
export type NoiseRequestParams = {
  granularity?: Granularity;
  start?: string;
  end?: string;
  page?: number;
};

/**
 * Single location type.
 */
export type Location = {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
  latestTimestamp: string;
};

export type LocationFormatted = Location & { isSendingData: boolean };

/**
 * Locations data type.
 */
export type LocationsData = {
  locations: Location[];
};

/**
 * Noise measurement value.
 */
export type Noise = {
  min: number;
  max: number;
  mean: number;
};

/**
 * Point-in-time noise measurement value with timestamp.
 */
export type NoiseTimed = {
  timestamp: string;
} & Noise;

/**
 * Aggregate noise measurement corresponding to a time interval.
 */
export type NoiseAggregate = {
  start?: string;
  end?: string;
  count: number;
} & Noise;

/**
 * Timed location noise data.
 */
export type TimedLocationNoiseData = {
  measurements: NoiseTimed[];
};

/**
 * Aggregate noise data for a location.
 */
export type AggregateLocationNoiseData = {
  measurements: NoiseAggregate[];
};
