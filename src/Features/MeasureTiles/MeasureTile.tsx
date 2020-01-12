import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from 'urql';
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  CardActions,
  Button,
  CircularProgress,
  makeStyles,
} from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Refresh';
import { Store } from '../../store';
import { Measure, actions } from './reducer';
import { GetLastKnownMeasurementResult, getLastKnownMeasurementQuery } from './queries';

const icons: { [metric: string]: string | undefined } = {
  waterTemp: 'https://cdn2.iconfinder.com/data/icons/car-parts-8/128/yumminky-cars-96-512.png',
  casingPressure:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi86KNpsu3_qlAZiktqKxTqXtKzVm8YHpOkXug_3XwbbnWFnh8&s',
  injValveOpen: undefined,
  flareTemp:
    'https://i.dlpng.com/static/png/3953525-temp-temperature-thermometer-icon-png-and-vector-for-free-temperature-png-black-and-white-512_512_preview.webp',
  oilTemp: 'https://user-images.githubusercontent.com/45227578/54439838-dd1ec500-4739-11e9-98b3-81a4324444da.png',
  tubingPressure:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6NYh49K91SfYDrsegteQ-yOCRzxv4qIMs5H8h1vn3fo7DpkTm&s',
};

const titles: { [metric: string]: string | undefined } = {
  waterTemp: 'Water Temperature',
  casingPressure: 'Casing Pressure',
  injValveOpen: 'Injection Valve Open',
  flareTemp: 'Flare Temperature',
  oilTemp: 'Oil Temperature',
  tubingPressure: 'Tubing Pressure',
};

const useStyles = makeStyles({
  card: {
    margin: '2rem .5rem 0',
    minWidth: 380,
  },
  subHeaderCard: {
    fontSize: '10px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

interface MeasureTileProps {
  metricName: string;
}

const MeasureTile: React.FC<MeasureTileProps> = ({ metricName }) => {
  const dispatch = useDispatch();
  const measure = useSelector<Store, Measure>(store => store.measures.latestMeasure[metricName]);
  const isLive = useSelector<Store, boolean>(store => store.measures.config[metricName].liveData);

  const switchLiveUpdate = () => {
    dispatch(actions.updateConfig({ configName: 'liveData', metric: metricName, value: !isLive }));
  };

  const [result, update] = useQuery<GetLastKnownMeasurementResult>({
    query: getLastKnownMeasurementQuery,
    variables: { metricName },
  });
  const { fetching, data, error } = result;

  React.useEffect(() => {
    if (error) {
      dispatch(actions.measuresApiErrorReceived({ error: error.message }));
    }
    if (data) {
      dispatch(actions.pushMeasure({ ...data.getLastKnownMeasurement, origin: 'update' }));
    }
  }, [dispatch, data, error]);

  const classes = useStyles();

  const AvatarContent = icons[metricName] ? (
    <Avatar src={icons[metricName]} />
  ) : (
    <Avatar aria-label="recipe">{metricName[0].toUpperCase()}</Avatar>
  );

  const Action = (
    <FormGroup>
      <FormControlLabel control={<Switch checked={isLive} onChange={switchLiveUpdate} />} label="Live" />
    </FormGroup>
  );

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={AvatarContent}
        action={Action}
        title={titles[metricName] || metricName}
        subheader={`At: ${measure ? new Date(measure.at).toUTCString() : 'Updating...'}`}
        subheaderTypographyProps={{ className: classes.subHeaderCard }}
      />
      <CardContent>
        {fetching || !measure ? (
          <Typography color="textPrimary" component="div" align="center">
            <CircularProgress size={63} />
          </Typography>
        ) : (
          <>
            <Typography variant="h4" color="textPrimary" component="p" align="center">
              {measure.value.toFixed(2)}
            </Typography>
            <Typography variant="h5" color="textSecondary" component="p" align="center">
              {measure.unit === 'F' ? ' °F' : ` ${measure.unit}`}
            </Typography>
          </>
        )}
      </CardContent>
      <CardActions className={classes.buttons}>
        <Button
          color="primary"
          onClick={() => update({ requestPolicy: 'network-only' })}
          startIcon={<UpdateIcon />}
          disabled={isLive}
        >
          Update
        </Button>
        <Button variant="outlined" color="primary">
          Historical chart
        </Button>
      </CardActions>
    </Card>
  );
};

export default MeasureTile;
