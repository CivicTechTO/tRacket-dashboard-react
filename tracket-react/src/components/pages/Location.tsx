import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getLocationNoiseData, getLocations } from "../api/locations";
import { Location, TimedLocationNoiseData, Granularity } from "../../types/api";
import { CheckCircleIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import { LAYER_ATTRIBUTION, LAYER_URL } from "../../config";

const dateFormat = "YYYY-MM-DD HH:mm:ss";

const makeHue = (noiseValue: number) => {
  const noiseValueScaled = (noiseValue - 35) / 15;

  console.log(noiseValueScaled);

  // interpolate between green and red
  const hue = 120 - noiseValueScaled * 80;
  return hue;
};

const NoiseMeterChart = ({
  noiseValue,
  showTicks = true,
}: {
  noiseValue: number;
  showTicks?: boolean;
}) => (
  <div className="w-full">
    {showTicks && (
      <div className="flex justify-between">
        <span className="text-sm">30 dB</span>
        <span className="text-sm">80 dB</span>
      </div>
    )}
    <svg
      viewBox="0 0 100 4"
      style={{ width: "100%", height: "6px" }}
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" width="100" height="6" fill="lightgray" />
      <rect
        x="0"
        y="0"
        width={((noiseValue - 30) / 50) * 100}
        height="4"
        fill={`hsl(${makeHue(noiseValue)}, 100%, 50%)`}
      />
    </svg>
  </div>
);

const MapView = ({ location }: { location: Location }) => {
  return (
    <div className="w-1/2 h-full p-20 shadow-log rounded-xl">
      <MapContainer
        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
        center={[location.latitude, location.longitude]}
        zoom={30}
        scrollWheelZoom={false}
        dragging={false}
      >
        <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />
        <CircleMarker
          center={[location.latitude, location.longitude]}
          radius={location.radius}
        >
          <span>{location.label}</span>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

const LocationDetails = ({ location }: { location: Location }) => (
  <div className="w-content">
    <h1>{location.label}</h1>
    <div className="flex items-center">
      {location.active ? (
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      ) : (
        <NoSymbolIcon className="h-6 w-6 text-red-500" />
      )}
      <span className="text-sm ml-2">
        {location.active ? "Active" : "Inactive"}
      </span>
      {location.active && (
        <span className="text-sm text-gray-500 ml-5">
          Last updated: {dayjs(location.latestTimestamp).format(dateFormat)}
        </span>
      )}
    </div>
  </div>
);

const NoiseData = ({
  noiseData,
}: {
  noiseData: TimedLocationNoiseData | undefined;
}) => {
  if (!noiseData) {
    return (
      <div className="w-1/2 flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (noiseData.measurements.length === 0) {
    return <div>No noise data available</div>;
  }

  const latestNoise = noiseData.measurements.slice(-1)[0];

  const last7days = noiseData.measurements.slice(-7 * 24);
  const mean7Days =
    last7days.reduce((acc, curr) => acc + curr.mean, 0) / last7days.length;

  const last7daysDay = last7days.filter(
    (measurement) => dayjs(measurement.timestamp).hour() >= 6
  );
  const mean7DaysDay =
    last7daysDay.reduce((acc, curr) => acc + curr.mean, 0) /
    last7daysDay.length;

  const last7daysEvening = last7days.filter(
    (measurement) => dayjs(measurement.timestamp).hour() >= 18
  );
  const mean7DaysEvening =
    last7daysEvening.reduce((acc, curr) => acc + curr.mean, 0) /
    last7daysEvening.length;

  const last7daysNight = last7days.filter(
    (measurement) => dayjs(measurement.timestamp).hour() >= 0
  );
  const mean7DaysNight =
    last7daysNight.reduce((acc, curr) => acc + curr.mean, 0) /
    last7daysNight.length;

  console.log(noiseData.measurements.slice(-7 * 24).length);

  return (
    <div className="w-1/2">
      <div className="w-full flex justify-between bg-white rounded-xl p-4 shadow-lg mb-5">
        <div className="w-1/2 p-4">
          <h2>
            <span className="font-medium text-xl mr-2">Last Hour</span> Average
            Noise
          </h2>
          <NoiseMeterChart noiseValue={latestNoise.mean} />
          <p className="text-3xl mb-2">{latestNoise.mean.toFixed(1)} dB</p>
        </div>
        <div className="w-1/2 p-4">
          <p className="text-sm text-gray-500 mb-1">Last updated</p>
          <p className="text-md mb-2">
            {dayjs(latestNoise.timestamp).format(dateFormat)}
          </p>
        </div>
      </div>
      <div className="w-full flex justify-between bg-white rounded-xl p-4 shadow-lg mb-5">
        <div className="w-1/2 p-4">
          <h2 className="mb-2">
            <span className="font-medium text-xl mr-1">Last 7 Days</span>{" "}
            Average Noise
          </h2>
          <NoiseMeterChart noiseValue={mean7Days} />
          <p className="text-3xl mb-2">{mean7Days.toFixed(1)} dB</p>
        </div>
        <div className="w-1/2 p-4">
          <h3 className="font-medium">Day</h3>
          <NoiseMeterChart noiseValue={mean7DaysDay} showTicks={false} />
          <p className="text-xl mb-2">{mean7DaysDay.toFixed(1)} dB</p>

          <h3 className="font-medium">Evening</h3>
          <NoiseMeterChart noiseValue={mean7DaysEvening} showTicks={false} />
          <p className="text-xl mb-2">{mean7DaysEvening.toFixed(1)} dB</p>

          <h3 className="font-medium">Night</h3>
          <NoiseMeterChart noiseValue={mean7DaysNight} showTicks={false} />
          <p className="text-xl mb-2">{mean7DaysNight.toFixed(1)} dB</p>
        </div>
      </div>
      <button className="bg-blue-500 text-white p-2 rounded-md shadow-md">
        Download all data as CSV
      </button>
    </div>
  );
};

const LocationPage = () => {
  const { id } = useParams<{ id: string }>();

  const [location, setLocation] = useState<Location>();
  const [noiseData, setNoiseData] = useState<TimedLocationNoiseData>();
  const [notFound, setNotFound] = useState<boolean>(false);

  const fetchLocations = async () => {
    if (!id) {
      return;
    }
    if (!id.match(/^\d+$/)) {
      setNotFound(true);
      return;
    }

    // Fetch location data
    const res = await getLocations(parseInt(id));
    if (res.locations.length === 0) {
      setNotFound(true);
      return;
    }

    setLocation(res.locations[0]);

    // Fetch noise data
    const noiseData = (await getLocationNoiseData(parseInt(id), {
      granularity: Granularity.Hourly,
    })) as TimedLocationNoiseData;

    setNoiseData(noiseData);
  };

  useEffect(() => {
    fetchLocations();
  }, [id]);

  return location ? (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex justify-center items-center p-8 bg-white">
        <LocationDetails location={location} />
      </div>
      <div className="grow flex md:flex-row flex-col justify-around items-center bg-gradient-to-b from-emerald-500 to-gray-100 px-16 py-8">
        <MapView location={location} />
        <NoiseData noiseData={noiseData} />
      </div>
    </div>
  ) : (
    "Loading..."
  );
};

export default LocationPage;
