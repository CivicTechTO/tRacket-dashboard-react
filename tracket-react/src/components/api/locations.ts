import { LocationSchema, LocationsData } from "../../types/api";
import { getTracketApi } from "./base";

export const getLocations = async (
  locationID?: string
): Promise<LocationsData> => {
  const endpoint = locationID ? `/locations/${locationID}` : "/locations";

  const json = await getTracketApi(endpoint);

  const result = json as LocationsData;
  const locationsData: LocationsData = { locations: [] };

  for await (const location of result.locations) {
    const validatedResult = LocationSchema.parse(location);
    locationsData.locations.push(validatedResult);
  }

  return locationsData;
};
