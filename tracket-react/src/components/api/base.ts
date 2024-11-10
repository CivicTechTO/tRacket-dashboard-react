import { NoiseRequestParams } from "../../types/api";
import { NoiseRequestParamsSchema } from "../../validation/api";

const makeTracketApiRequest = async (
  endpoint: string,
  params?: NoiseRequestParams
): Promise<any> => {
  let fullUrl = import.meta.env.VITE_TRACKET_API_URL + endpoint;

  try {
    if (params) {
      const validationResult = NoiseRequestParamsSchema.parse(params);
      const queryParams = new URLSearchParams(validationResult);
      fullUrl = fullUrl.concat("?", queryParams.toString());
    }

    const response = await fetch(fullUrl, {
      method: "GET",
    });
    const json = await response.json();
    return json;
  } catch (error: any) {
    console.error(error.message);
  }
};

export const getTracketApi = (endpoint: string) =>
  makeTracketApiRequest(endpoint);
