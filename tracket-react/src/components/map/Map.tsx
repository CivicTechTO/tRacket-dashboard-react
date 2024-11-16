import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  LAYER_ATTRIBUTION,
  LAYER_URL,
  MAP_CENTER_LAT,
  MAP_CENTER_LON,
  ZOOM,
} from "../../config";

const Map = () => {
  return (
    <MapContainer center={[MAP_CENTER_LAT, MAP_CENTER_LON]} zoom={ZOOM}>
      <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />
    </MapContainer>
  );
};

export default Map;
