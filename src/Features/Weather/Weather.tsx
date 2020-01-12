import React, { useEffect } from 'react';
import { useQuery } from 'urql';
import { useGeolocation } from 'react-use';
import LinearProgress from '@material-ui/core/LinearProgress';
import { toast } from 'react-toastify';
import { Avatar } from '@material-ui/core';
import Chip from '../../components/Chip';
import { getWeatherForLocationQuery } from './queries';

/*

I'll disconnect this component from the redux beacause there isn't a reason to share its status.
Share unused state in the redux is a bad practice.

And also I'll move the urql Provider to App.tsx

*/
const weatherIcon =
  'https://icons-for-free.com/iconfiles/png/512/forecast+partly+cloudy+weather+icon-1320196484400215944.png';

interface WeatherData {
  description: string;
  locationName: string;
  temperatureinCelsius: number;
}

interface WeatherResponse {
  getWeatherForLocation: WeatherData;
}

const toF = (c: number) => (c * 9) / 5 + 32;

const Weather = React.memo(() => {
  // Location
  const getLocation = useGeolocation();
  // Default to houston
  const latLong = {
    latitude: getLocation.latitude || 29.7604,
    longitude: getLocation.longitude || -95.3698,
  };

  // Store data or null
  const [currentWeather, setCurrentWeather] = React.useState<WeatherData | null>(null);

  const [result, retry] = useQuery<WeatherResponse>({
    query: getWeatherForLocationQuery,
    variables: {
      latLong,
    },
  });
  const { fetching, data, error } = result;

  useEffect(() => {
    if (error) {
      toast.error(`Error Received: ${error.message}`);
    }

    if (data && data.getWeatherForLocation) {
      setCurrentWeather(data.getWeatherForLocation);
    }
  }, [data, error]);

  if (fetching) return <LinearProgress />;

  // If data is null make it retryable making a resilient component
  const text = currentWeather
    ? `Weather in ${currentWeather.locationName}: ${currentWeather.description} and ${toF(
        currentWeather.temperatureinCelsius,
      )}°`
    : 'Click to retry';

  return (
    <Chip
      avatar={<Avatar src={weatherIcon} />}
      clickable={!currentWeather}
      label={text}
      onClick={() => !currentWeather && retry()}
    />
  );
});

export default Weather;
