import { NoiseRequestParams } from "../../types/api";

export const makeTracketApiRequest = async (
  endpoint: string,
  params?: NoiseRequestParams
): Promise<any> => {
  let fullUrl = import.meta.env.VITE_TRACKET_API_URL + endpoint;

  try {
    if (params) {
      // @ts-ignore
      // { page: <number> } incompatible with Record<string, string>
      // But it's implicitly cast to a string
      const queryParams = new URLSearchParams(params);
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
