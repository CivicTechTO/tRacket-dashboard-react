import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LAYER_ATTRIBUTION,
  LAYER_URL,
  MAP_CENTER_LAT,
  MAP_CENTER_LON,
  ZOOM,
} from '../../config';
import { useEffect, useState } from 'react';
import { formatLocations, getLocations } from '../api/locations';
import { type LocationFormatted } from '../../types/api';
import CustomMarkerClusterGroup from './CustomMarkerClusterGroup';

const Map = () => {
  const [locations, setLocations] = useState<LocationFormatted[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await getLocations();
        const formattedLocations = formatLocations(result.locations);
        setLocations(formattedLocations);
      } catch (err: unknown) {
        console.error(err);
      }
    };

    fetchLocations();
  }, []);

  return (
    <MapContainer center={[MAP_CENTER_LAT, MAP_CENTER_LON]} zoom={ZOOM}>
      <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />
      <CustomMarkerClusterGroup locations={locations} />
    </MapContainer>
  );
};

export default Map;
