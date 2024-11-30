import MarkerClusterGroup from 'react-leaflet-cluster';
import { LocationFormatted } from '../../types/api';
import { divIcon, LatLngTuple, type MarkerCluster, point } from 'leaflet';
import {
  MARKER_BORDER_COLOR,
  MARKER_COLOR_HIGHLIGHT,
  MARKER_COLOR_INACTIVE,
  RADIUS_PIXEL,
} from '../../config';
import { CircleMarker } from 'react-leaflet';
import CustomTooltip from './CustomTooltip';

const CustomMarkerClusterGroup = ({
  locations,
}: {
  locations: LocationFormatted[];
}) => {
  function createCustomClusterFn(cluster: MarkerCluster) {
    const count = cluster.getChildCount();

    return divIcon({
      html: `<div style="background-color:white;"><span>${count}</span></div>`,
      className: 'marker-cluster',
      iconSize: point(40, 40),
    });
  }

  return (
    <MarkerClusterGroup iconCreateFunction={createCustomClusterFn}>
      {locations.map((l) => {
        const position: LatLngTuple = [l.latitude, l.longitude];
        const activeStatus = l.isSendingData
          ? 'Active Location'
          : 'Inactive Location';
        const locationLabel = l.label || '';

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
            <CustomTooltip
              activeStatus={activeStatus}
              locationLabel={locationLabel}
            />
          </CircleMarker>
        );
      })}
    </MarkerClusterGroup>
  );
};

export default CustomMarkerClusterGroup;
