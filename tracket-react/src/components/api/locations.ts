import { getTracketApi } from "./base";

export const getLocations = () => getTracketApi("/locations");
