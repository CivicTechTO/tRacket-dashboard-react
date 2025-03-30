import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getLocationNoiseData, getLocations } from '../api/locations';
import {
  Location,
  TimedLocationNoiseData,
  Granularity,
  NoiseTimed,
} from '../../types/api';
import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { Circle, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { LAYER_ATTRIBUTION, LAYER_URL } from '../../config';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
} from 'recharts';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

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
  <div className='w-full'>
    {showTicks && (
      <div className='flex justify-between'>
        <span className='text-sm'>30 dB</span>
        <span className='text-sm'>80 dB</span>
      </div>
    )}
    <svg
      viewBox='0 0 100 4'
      style={{ width: '100%', height: '6px' }}
      preserveAspectRatio='none'>
      <rect x='0' y='0' width='100' height='6' fill='lightgray' />
      <rect
        x='0'
        y='0'
        width={((noiseValue - 30) / 50) * 100}
        height='4'
        fill={`hsl(${makeHue(noiseValue)}, 100%, 50%)`}
      />
    </svg>
  </div>
);

const MapView = ({ location }: { location: Location }) => {
  return (
    <div className='w-1/3 h-full p-8 shadow-log rounded-xl'>
      <MapContainer
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        center={[location.latitude, location.longitude]}
        zoom={20}
        scrollWheelZoom={false}
        dragging={false}>
        <TileLayer url={LAYER_URL} attribution={LAYER_ATTRIBUTION} />
        <Circle
          center={[location.latitude, location.longitude]}
          radius={location.radius}>
          <span>{location.label}</span>
        </Circle>
      </MapContainer>
    </div>
  );
};

const LocationDetails = ({ location }: { location: Location }) => (
  <div className='w-content'>
    <h1>{location.label}</h1>
    <div className='flex items-center'>
      {location.active ? (
        <CheckCircleIcon className='h-6 w-6 text-green-500' />
      ) : (
        <NoSymbolIcon className='h-6 w-6 text-red-500' />
      )}
      <span className='text-sm ml-2'>
        {location.active ? 'Active' : 'Inactive'}
      </span>
      {location.active && (
        <span className='text-sm text-gray-500 ml-5'>
          Last updated: {dayjs(location.latestTimestamp).format(dateFormat)}
        </span>
      )}
    </div>
  </div>
);

const NoiseChart = ({ measurements }: { measurements: NoiseTimed[] }) => (
  <ResponsiveContainer height={100}>
    <ComposedChart
      data={
        measurements.map((measurement) => ({
          mean: measurement.mean,
          minMax: [measurement.min, measurement.max],
          timestamp: dayjs(measurement.timestamp).valueOf(),
        })) || []
      }
      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
      <Line type='monotone' dataKey='mean' stroke='#8884d8' dot={false} />
      <Area type='monotone' dataKey='minMax' stroke='#8884d8' fill='#8884d8' />
      <CartesianGrid stroke='#ccc' />
      <XAxis
        dataKey='timestamp'
        ticks={[...Array(3).keys()].map((i) =>
          dayjs(
            measurements[Math.floor(measurements.length / 3 - 1) * i].timestamp
          ).valueOf()
        )}
        tickFormatter={(time) => dayjs(time).format('YYYY-MM-DD HH:mm')}
      />
      <Tooltip />
    </ComposedChart>
  </ResponsiveContainer>
);

const NoiseData = ({
  noiseData,
  rawNoiseData,
}: {
  noiseData: TimedLocationNoiseData | undefined;
  rawNoiseData: TimedLocationNoiseData | undefined;
}) => {
  if (!noiseData || !rawNoiseData) {
    return (
      <div className='w-2/3 flex justify-center items-center'>Loading...</div>
    );
  }

  if (noiseData.measurements.length === 0) {
    return <div>No noise data available</div>;
  }

  const latestNoise = noiseData.measurements.slice(-1)[0];

  const last7days = noiseData.measurements.slice(-14 * 24);
  const mean7Days =
    last7days.reduce((acc, curr) => acc + curr.mean, 0) / last7days.length;

  const last7daysDay = last7days.filter(
    (measurement) =>
      dayjs(measurement.timestamp).hour() >= 7 &&
      dayjs(measurement.timestamp).hour() < 19
  );
  const mean7DaysDay =
    last7daysDay.reduce((acc, curr) => acc + curr.mean, 0) /
    last7daysDay.length;

  const last7daysEvening = last7days.filter(
    (measurement) =>
      dayjs(measurement.timestamp).hour() >= 19 &&
      dayjs(measurement.timestamp).hour() < 23
  );
  const mean7DaysEvening =
    last7daysEvening.reduce((acc, curr) => acc + curr.mean, 0) /
    last7daysEvening.length;

  const last7daysNight = last7days.filter(
    (measurement) =>
      dayjs(measurement.timestamp).hour() >= 23 ||
      dayjs(measurement.timestamp).hour() < 7
  );
  const mean7DaysNight =
    last7daysNight.reduce((acc, curr) => acc + curr.mean, 0) /
    last7daysNight.length;

  return (
    <div className='w-2/3 p-4'>
      <div className='w-full flex gap-4'>
        <div className='w-1/3 flex justify-between bg-white rounded-xl p-4 shadow-lg mb-5'>
          <div className='w-full p-4'>
            <h2>
              <span className='font-medium text-xl mr-2'>Last Hour</span>{' '}
              Average Noise
            </h2>
            <NoiseMeterChart noiseValue={latestNoise.mean} />
            <p className='text-3xl mb-2'>{latestNoise.mean.toFixed(1)} dB</p>
            <p className='text-sm text-gray-500 mt-5'>Last updated</p>
            <p className='text-md'>
              {dayjs(latestNoise.timestamp).format(dateFormat)}
            </p>
          </div>
        </div>
        <div className='w-2/3 flex justify-between bg-white rounded-xl p-4 shadow-lg mb-5'>
          <div className='w-1/2 p-4'>
            <h2 className='mb-2'>
              <span className='font-medium text-xl mr-1'>Last 14 Days</span>{' '}
              Average Noise
            </h2>
            <NoiseMeterChart noiseValue={mean7Days} />
            <p className='text-3xl mb-2'>{mean7Days.toFixed(1)} dB</p>
          </div>
          <div className='w-1/2 p-4'>
            <h3>
              <span className='font-medium'>Day</span>
              (07:00 - 19:00)
            </h3>
            <NoiseMeterChart noiseValue={mean7DaysDay} showTicks={false} />
            <p className='text-xl mb-2'>{mean7DaysDay.toFixed(1)} dB</p>

            <h3>
              <span className='font-medium'>Evening</span>
              (19:00 - 23:00)
            </h3>
            <NoiseMeterChart noiseValue={mean7DaysEvening} showTicks={false} />
            <p className='text-xl mb-2'>{mean7DaysEvening.toFixed(1)} dB</p>

            <h3>
              <span className='font-medium'>Night</span>
              (23:00 - 07:00)
            </h3>
            <NoiseMeterChart noiseValue={mean7DaysNight} showTicks={false} />
            <p className='text-xl mb-2'>{mean7DaysNight.toFixed(1)} dB</p>
          </div>
        </div>
      </div>
      <div className='w-full flex'>
        <div className='w-full bg-white rounded-xl p-4 shadow-lg'>
          <div className='w-full p-4'>
            <h2 className='text-xl mb-4'>Noise Data</h2>
            <NoiseChart measurements={rawNoiseData.measurements} />
            <button className='mt-1 bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus'>
              Download as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LocationPage = () => {
  const { id } = useParams<{ id: string }>();

  const [location, setLocation] = useState<Location>();
  const [noiseData, setNoiseData] = useState<TimedLocationNoiseData>();
  const [rawNoiseData, setRawNoiseData] = useState<TimedLocationNoiseData>();
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

    const latestNoise = noiseData.measurements.slice(-1)[0];
    const lastTimestamp = latestNoise.timestamp;

    const rawNoiseData = (await getLocationNoiseData(parseInt(id), {
      granularity: Granularity.Raw,
      start: dayjs(lastTimestamp).subtract(3, 'days').toISOString(),
    })) as TimedLocationNoiseData;

    setNoiseData(noiseData);
    setRawNoiseData(rawNoiseData);
  };

  useEffect(() => {
    fetchLocations();
  }, [id]);

  return location ? (
    <div className='h-screen w-screen flex flex-col'>
      <div className='flex justify-center items-center p-8 bg-white'>
        <LocationDetails location={location} />
      </div>
      <div className='grow flex md:flex-row flex-col justify-around items-center bg-gradient-to-b from-emerald-500 to-gray-100 px-16 py-8'>
        <MapView location={location} />
        <NoiseData noiseData={noiseData} rawNoiseData={rawNoiseData} />
      </div>
    </div>
  ) : (
    'Loading...'
  );
};

export default LocationPage;
