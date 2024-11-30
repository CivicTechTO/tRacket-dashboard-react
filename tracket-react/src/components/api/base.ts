/* eslint-disable @typescript-eslint/no-explicit-any */

import { HTTP_METHODS, NoiseRequestParams } from '../../types/api';

/**
 * Data loader from WebCOMAND API v1.
 * @param method Http method
 * @param endpoint Suffix to the base url
 * @param data Request payload and/or query parameters
 * @returns A POJO
 */
export const makeTracketApiRequest = async (
  method: HTTP_METHODS,
  endpoint: string,
  data?: {
    payload?: any;
    params?: NoiseRequestParams;
  }
): Promise<any> => {
  let fullUrl = import.meta.env.VITE_TRACKET_API_URL + endpoint;

  try {
    if (data && data.params) {
      // @ts-expect-error { page: <number> } incompatible with Record<string, string>
      // But it's implicitly cast to a string
      const queryParams = new URLSearchParams(data.params);
      fullUrl = fullUrl.concat('?', queryParams.toString());
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        Accept: 'application/json',
      },
    };

    if (data && data.payload && method !== 'GET') {
      requestOptions.body = JSON.stringify(data.payload);

      requestOptions.headers = {
        ...requestOptions.headers,
        'Content-Type': 'application/json',
      };
    }
    const response = await fetch(fullUrl, requestOptions);
    const pojo = await response.json();
    return pojo;
  } catch (error: any) {
    console.error(error.message);
  }
};
