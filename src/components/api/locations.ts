import {
  AggregateLocationNoiseData,
  Granularity,
  Location,
  LocationFormatted,
  LocationsData,
  NoiseRequestParams,
  TimedLocationNoiseData,
} from '../../types/api';
import { getActiveTimeLimit } from '../../utils';
import { makeTracketApiRequest } from './base';

/**
 * Get locations from the API.
 * If ID is specified, then info for only one location is fetched.
 * @param locationID
 */
export const getLocations = async (
  locationID?: number
): Promise<LocationsData> => {
  const endpoint = locationID
    ? `/locations/${String(locationID)}`
    : '/locations';

  const json = await makeTracketApiRequest('GET', endpoint);

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

/**
 * Get noise data for a location.
 * Loading is paginated by default unless caller provides explicit page.
 * @param locationID
 * @param params
 */
export const getLocationNoiseData = async (
  locationID: number,
  params?: NoiseRequestParams
): Promise<AggregateLocationNoiseData | TimedLocationNoiseData> => {
  const MEASUREMENTS_KEY = 'measurements';
  const endpoint = `/locations/${String(locationID)}/noise`;

  let noiseData = await makeTracketApiRequest('GET', endpoint, { params });

  const collectedNoiseData:
    | AggregateLocationNoiseData
    | TimedLocationNoiseData = { measurements: [] };

  collectedNoiseData[MEASUREMENTS_KEY] = [
    ...collectedNoiseData[MEASUREMENTS_KEY],
    ...noiseData[MEASUREMENTS_KEY],
  ];

  const { paginateParams, paginate } = checkPaginate(params);

  while (paginate && noiseData[MEASUREMENTS_KEY].length > 0) {
    if (paginateParams.page !== undefined) {
      paginateParams.page++;
    }

    noiseData = await makeTracketApiRequest('GET', endpoint, {
      params: paginateParams,
    });

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

/**
 * Decide if the API request should be paginated and set up the params accordingly.
 * Only paginate if the user did not provide params or page and if it's not an aggregate call.
 * @param params
 */
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

export const formatLocations = (locations: Location[]): LocationFormatted[] => {
  return locations.map((location) => {
    const formattedLocations: LocationFormatted = {
      ...location,
      isSendingData: setSendingDataFlag(location.latestTimestamp),
    };
    // TODO: format based on filterActive or deduplicate tags
    return formattedLocations;
  });
};

/**
 * Based on the lastest timestamp, check if device has been sending data recently.
 * @param timestamp Timestamp property fetched from the locations API
 */
export const setSendingDataFlag = (timestamp: string) => {
  const timestampDate = new Date(timestamp);
  const limit = getActiveTimeLimit();

  return timestampDate.getTime() > limit.getTime();
};
