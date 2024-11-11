import {
  AggregateLocationNoiseData,
  Granularity,
  LocationsData,
  NoiseRequestParams,
  TimedLocationNoiseData,
} from "../../types/api";
import { makeTracketApiRequest } from "./base";

export const getLocations = async (
  locationID?: number
): Promise<LocationsData> => {
  const endpoint = locationID
    ? `/locations/${String(locationID)}`
    : "/locations";

  const json = await makeTracketApiRequest(endpoint);

  const result = json as LocationsData;
  const locationsData: LocationsData = { locations: [] };

  for (const location of result.locations) {
    const data = {
      id: location.id,
      label: location.label,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      active: location.active,
      latestTimestamp: location.latestTimestamp,
    };
    locationsData.locations.push(data);
  }

  return locationsData;
};

export const getLocationNoiseData = async (
  locationID: number,
  params?: NoiseRequestParams
): Promise<AggregateLocationNoiseData | TimedLocationNoiseData> => {
  const MEASUREMENTS_KEY = "measurements";
  const endpoint = `/locations/${String(locationID)}/noise`;

  let noiseData = await makeTracketApiRequest(endpoint, params);

  const collectedNoiseData:
    | AggregateLocationNoiseData
    | TimedLocationNoiseData = { measurements: [] };

  collectedNoiseData[MEASUREMENTS_KEY] = [
    ...collectedNoiseData[MEASUREMENTS_KEY],
    ...noiseData[MEASUREMENTS_KEY],
  ];

  const { paginateParams, paginate } = checkPaginate(params);

  while (paginate && noiseData[MEASUREMENTS_KEY].length > 0) {
    if (paginateParams.page) {
      paginateParams.page++;
    }

    noiseData = await makeTracketApiRequest(endpoint, paginateParams);

    collectedNoiseData[MEASUREMENTS_KEY] = [
      ...collectedNoiseData[MEASUREMENTS_KEY],
      ...noiseData[MEASUREMENTS_KEY],
    ];
  }

  if (params && params.granularity === Granularity.LifeTime) {
    return collectedNoiseData as AggregateLocationNoiseData;
  } else {
    return collectedNoiseData as TimedLocationNoiseData;
  }
};

export const checkPaginate = (
  params?: NoiseRequestParams
): { paginateParams: NoiseRequestParams; paginate: boolean } => {
  let paginate = false;

  if (params === undefined) {
    params = { page: 0 };
    paginate = true;
  } else if (
    params &&
    params.page === undefined &&
    params.granularity !== Granularity.LifeTime
  ) {
    params.page = 0;
    paginate = true;
  }

  return { paginateParams: params, paginate };
};
