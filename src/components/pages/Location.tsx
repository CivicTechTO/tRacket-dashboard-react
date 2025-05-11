import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { getLocationNoiseData, getLocations } from '../api/locations';
import {
  Location,
  TimedLocationNoiseData,
  Granularity,
  AggregateLocationNoiseData,
  NoiseTimed,
} from '../../types/api';
import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { Circle, MapContainer, TileLayer } from 'react-leaflet';
import { LAYER_ATTRIBUTION, LAYER_URL } from '../../config';
import Plot from 'react-plotly.js';

interface NoiseSummaryPointData {
  timestamp: dayjs.Dayjs;
  value: number;
}

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const makeHue = (noiseValue: number) => {
  const noiseValueScaled = (noiseValue - 35) / 24;

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
        zoom={16}
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
    <h1 className='text-4xl'>{location.label}</h1>
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

const NoiseChart = ({ measurements }: { measurements: NoiseTimed[] }) => {
  const data = useMemo(
    () =>
      measurements.map((measurement) => ({
        x: dayjs(measurement.timestamp).format(dateFormat),
        ...measurement,
      })),
    []
  );

  if (data.length === 0) {
    return <div>No noise data available</div>;
  }

  return (
    <div className='h-64 w-full'>
      <Plot
        data={[
          {
            name: 'Min',
            x: data.map((d) => d.x),
            y: data.map((d) => d.min),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'orange' },
          },
          {
            name: 'Max',
            x: data.map((d) => d.x),
            y: data.map((d) => d.max),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'orange' },
          },
          {
            name: 'Average',
            x: data.map((d) => d.x),
            y: data.map((d) => d.mean),
            type: 'scatter',
            marker: {
              color: 'red',
            },
          },
        ]}
        layout={{
          title: 'Noise Data',
          xaxis: {
            title: 'Time',
            type: 'date',
            tickformat: '%Y-%m-%d %H:%M:%S',
            tickangle: 0,
          },
          yaxis: {
            title: 'Noise (dB)',
          },
          margin: {
            t: 5,
            b: 50,
            l: 20,
            r: 20,
          },
        }}
        config={{
          displayModeBar: false,
          displaylogo: false,
        }}
        style={{ width: '100%', height: '100%', padding: '0px', margin: '0px' }}
      />
    </div>
  );
};

const NoiseData = ({ location }: { location: Location }) => {
  const [lastHour, setLastHour] = useState<NoiseSummaryPointData>();
  const [last14Days, setLast14Days] = useState<NoiseSummaryPointData>();
  const [last14DaysDay, setLast14DaysDay] = useState<NoiseSummaryPointData>();
  const [last14DaysEvening, setLast14DaysEvening] =
    useState<NoiseSummaryPointData>();
  const [last14DaysNight, setLast14DaysNight] =
    useState<NoiseSummaryPointData>();
  const [rawNoiseData, setRawNoiseData] = useState<TimedLocationNoiseData>();

  useEffect(() => {
    const fetchNoiseData = async () => {
      if (!location) {
        return;
      }

      const id = location.id.toString();

      const lastTimestampRes = (await getLocationNoiseData(parseInt(id), {
        granularity: Granularity.LifeTime,
      })) as AggregateLocationNoiseData;
      const lastTimestamp = dayjs(lastTimestampRes.measurements[0].end);

      const lastHour = await getTimedAverageNoise(location, lastTimestamp, 1);
      setLastHour(lastHour);

      const last14Days = await getTimedAverageNoise(
        location,
        lastTimestamp,
        14 * 24
      );
      setLast14Days(last14Days);

      const last14DaysDay = await getTimedAverageNoise(
        location,
        lastTimestamp,
        14 * 24,
        'day'
      );
      const last14DaysEvening = await getTimedAverageNoise(
        location,
        lastTimestamp,
        14 * 24,
        'evening'
      );
      const last14DaysNight = await getTimedAverageNoise(
        location,
        lastTimestamp,
        14 * 24,
        'night'
      );
      setLast14DaysDay(last14DaysDay);
      setLast14DaysEvening(last14DaysEvening);
      setLast14DaysNight(last14DaysNight);

      const rawNoiseData = (await getLocationNoiseData(parseInt(id), {
        granularity: Granularity.Raw,
        start: lastTimestamp.subtract(14, 'day'),
      })) as TimedLocationNoiseData;
      setRawNoiseData(rawNoiseData);
    };

    fetchNoiseData();
  }, [location]);

  if (!lastHour) {
    return (
      <div className='w-2/3 flex justify-center items-center text-sm'>
        Loading...
      </div>
    );
  }

  if (!lastHour) {
    return <div>No noise data available</div>;
  }

  return (
    <div className='w-2/3 h-full flex flex-col overflow-hidden'>
      <div className='w-full flex-1 overflow-y-auto'>
        <div className='w-full flex gap-3 p-3'>
          <div className='w-1/3 flex justify-between bg-background-primary rounded-xl p-3 shadow-lg mb-5 h-full'>
            <div className='w-full p-3'>
              <h2>
                <span className='font-medium text-lg mr-2'>Last Hour</span>{' '}
                Average Noise
              </h2>
              <NoiseMeterChart noiseValue={lastHour.value} />
              <p className='text-2xl mb-2'>{lastHour.value.toFixed(1)} dB</p>
              <p className='text-sm text-gray-500 mt-5'>Last updated</p>
              <p className='text-sm'>
                {dayjs(lastHour.timestamp).format(dateFormat)}
              </p>
            </div>
          </div>
          <div className='w-2/3 flex justify-between bg-background-primary rounded-xl p-3 shadow-lg mb-5 h-'>
            <div className='w-1/2 p-3'>
              <h2 className='mb-2'>
                <span className='font-medium text-lg mr-1'>Last 14 Days</span>{' '}
                Average Noise
              </h2>
              {last14Days ? (
                <>
                  <NoiseMeterChart noiseValue={last14Days.value} />
                  <p className='text-2xl mb-2'>
                    {last14Days.value.toFixed(1)} dB
                  </p>
                </>
              ) : (
                <p className='text-sm mb-2 h-12'>Loading...</p>
              )}
            </div>
            <div className='w-1/2 p-3'>
              <h3>
                <span className='font-medium'>Day</span>
                (07:00 - 19:00)
              </h3>
              {last14DaysDay ? (
                <>
                  <NoiseMeterChart noiseValue={last14DaysDay.value} />
                  <p className='text-lg mb-2'>
                    {last14DaysDay.value.toFixed(1)} dB
                  </p>
                </>
              ) : (
                <p className='text-sm mb-2 h-12'>Loading...</p>
              )}

              <h3>
                <span className='font-medium'>Evening</span>
                (19:00 - 23:00)
              </h3>
              {last14DaysEvening ? (
                <>
                  <NoiseMeterChart noiseValue={last14DaysEvening.value} />
                  <p className='text-lg mb-2'>
                    {last14DaysEvening.value.toFixed(1)} dB
                  </p>
                </>
              ) : (
                <p className='text-sm mb-2 h-12'>Loading...</p>
              )}

              <h3>
                <span className='font-medium'>Night</span>
                (23:00 - 07:00)
              </h3>
              {last14DaysNight ? (
                <>
                  <NoiseMeterChart noiseValue={last14DaysNight.value} />
                  <p className='text-lg mb-2'>
                    {last14DaysNight.value.toFixed(1)} dB
                  </p>
                </>
              ) : (
                <p className='text-sm mb-2 h-12'>Loading...</p>
              )}
            </div>
          </div>
        </div>
        <div className='w-full flex'>
          <div className='w-full bg-background-primary rounded-xl p-3 shadow-lg'>
            <div className='w-full p-3 flex flex-col gap-3 items-start'>
              <h2 className='text-lg mr-8'>Noise Data</h2>
              {rawNoiseData && (
                <NoiseChart measurements={rawNoiseData.measurements} />
              )}
              {!rawNoiseData && (
                <div className='flex justify-center items-center h-64'>
                  <p className='text-sm'>Loading...</p>
                </div>
              )}
              <button className='bg-honest-eds text-white font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus'>
                Download as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getTimedAverageNoise = async (
  location: Location,
  timestamp: dayjs.Dayjs,
  timeInHours: number,
  period?: 'day' | 'evening' | 'night'
) => {
  const res = getLocationNoiseData(location.id, {
    granularity: Granularity.LifeTime,
    start: timestamp.subtract(timeInHours, 'hour'),
    hours: period,
  });

  const noiseData = (await res) as AggregateLocationNoiseData;
  const lastNoise = noiseData.measurements[0];

  return {
    timestamp: dayjs(lastNoise.end),
    value: lastNoise.mean,
  } as NoiseSummaryPointData;
};

const LocationPage = () => {
  const { id } = useParams<{ id: string }>();

  const [location, setLocation] = useState<Location>();
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
    const _location = res.locations[0];
    setLocation(_location);
  };

  useEffect(() => {
    fetchLocations();
  }, [id]);

  return notFound ? (
    <div className='h-screen w-screen flex justify-center items-center'>
      <h1>Location not found</h1>
    </div>
  ) : location ? (
    <div className='h-screen w-screen flex flex-col'>
      <div className='flex justify-center items-center p-6 bg-background-primary'>
        <LocationDetails location={location} />
      </div>
      <div className='grow flex justify-around items-center bg-honest-eds px-8 py-4 overflow-hidden'>
        <MapView location={location} />
        <NoiseData location={location} />
      </div>
    </div>
  ) : (
    <div className='h-screen w-screen flex justify-center items-center'>
      <h1>Loading...</h1>
    </div>
  );
};

export default LocationPage;
