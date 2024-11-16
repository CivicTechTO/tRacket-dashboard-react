import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  LAYER_ATTRIBUTION,
  LAYER_URL,
  MAP_CENTER_LAT,
  MAP_CENTER_LON,
  ZOOM,
} from "../../config";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState } from "react";
import { getLocations } from "../api/locations";
import { type Location } from "../../types/api";
import { type LatLngTuple } from "leaflet";

const Map = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await getLocations();
        setLocations(result.locations);
      } catch (err: unknown) {
        console.error(err);
      }
    };

    fetchLocations();
  }, []);

  return (
    <MapContainer center={[MAP_CENTER_LAT, MAP_CENTER_LON]} zoom={ZOOM}  zoomControl={true}>
      <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />

      <MarkerClusterGroup>
        {locations.map((l) => {
          const position: LatLngTuple = [l.latitude, l.longitude];
          const toolTipActive = l.active
            ? "Active Location"
            : "Inactive Location";
          const toolTipLabel = l.label || "";

          return (
            <Marker position={position} key={l.id}>
              <Tooltip>
                <div>
                  <b>{toolTipActive}</b>
                  <br></br>
                  {toolTipLabel}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
