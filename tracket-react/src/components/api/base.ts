const makeTracketApiRequest = async (url: string, method: string = 'GET', data: any = undefined) => {
    try {
        const response = await fetch(
            import.meta.env.VITE_TRACKET_API_URL + url, {
            method, body: JSON.stringify(data)
        });

        const json = await response.json();
        return json;
    } catch (error: any) {
        console.error(error.message);
    }
}

export const getTracketApi = (url: string) => makeTracketApiRequest(url);