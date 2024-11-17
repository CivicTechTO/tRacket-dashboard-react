import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
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
import { formatLocations, getLocations } from "../api/locations";
import { type LocationFormatted } from "../../types/api";
import { type LatLngTuple } from "leaflet";

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
    <MapContainer
      center={[MAP_CENTER_LAT, MAP_CENTER_LON]}
      zoom={ZOOM}
      zoomControl={true}
    >
      <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />

      <MarkerClusterGroup>
        {locations.map((l) => {
          const position: LatLngTuple = [l.latitude, l.longitude];
          const toolTipActive = l.isSendingData
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
