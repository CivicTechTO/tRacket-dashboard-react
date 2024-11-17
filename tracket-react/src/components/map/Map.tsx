import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  LAYER_ATTRIBUTION,
  LAYER_URL,
  MAP_CENTER_LAT,
  MAP_CENTER_LON,
  MARKER_BORDER_COLOR,
  MARKER_COLOR_HIGHLIGHT,
  MARKER_COLOR_INACTIVE,
  RADIUS_PIXEL,
  ZOOM,
} from "../../config";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState } from "react";
import { formatLocations, getLocations } from "../api/locations";
import { type LocationFormatted } from "../../types/api";
import { divIcon, type MarkerCluster, type LatLngTuple, point } from "leaflet";

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

  function createCustomClusterFn(cluster: MarkerCluster) {
    const count = cluster.getChildCount();

    return divIcon({
      html: `<div style="background-color:white;"><span>${count}</span></div>`,
      className: "marker-cluster",
      iconSize: point(40, 40),
    });
  }

  return (
    <MapContainer center={[MAP_CENTER_LAT, MAP_CENTER_LON]} zoom={ZOOM}>
      <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />

      <MarkerClusterGroup iconCreateFunction={createCustomClusterFn}>
        {locations.map((l) => {
          const position: LatLngTuple = [l.latitude, l.longitude];
          const toolTipActive = l.isSendingData
            ? "Active Location"
            : "Inactive Location";
          const toolTipLabel = l.label || "";

          const markerColor = l.isSendingData
            ? MARKER_COLOR_HIGHLIGHT
            : MARKER_COLOR_INACTIVE;

          return (
            <CircleMarker
              center={position}
              radius={RADIUS_PIXEL}
              fillColor={markerColor}
              fillOpacity={0.8}
              stroke={true}
              color={MARKER_BORDER_COLOR}
              opacity={0.5}
              weight={2}
            >
              <Tooltip>
                <div>
                  <b>{toolTipActive}</b>
                  <br></br>
                  {toolTipLabel}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
