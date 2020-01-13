import * as React from 'react';
import { useQuery, useSubscription } from 'urql';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, CircularProgress, makeStyles } from '@material-ui/core';
import { getMetricsQuery, GetMetricsResult, newMeasurementSubscription, NewMeasurementResult } from './queries';
import { actions } from './reducer';
import { Store } from '../../store';
import MeasureTile from './MeasureTile';

const useStyles = makeStyles({
  container: {
    marginBottom: '3rem',
  },
});

const MeasureTiles: React.FC = () => {
  const dispatch = useDispatch();
  const metricList = useSelector<Store, string[]>(state => state.measures.metricList);

  const [result] = useQuery<GetMetricsResult>({ query: getMetricsQuery });

  const { fetching: fetchingList, data: dataList, error: errorList } = result;

  React.useEffect(() => {
    if (errorList) {
      dispatch(actions.measuresApiErrorReceived({ error: errorList.message }));
    }
    if (dataList) {
      dispatch(actions.updateMetricList(dataList.getMetrics));
    }
  }, [dataList, errorList, dispatch]);

  const [resultSubs] = useSubscription<NewMeasurementResult>({ query: newMeasurementSubscription });

  const { data, error } = resultSubs;

  // const listenLive = useSelector<Store, boolean>(
  //   state => Object.values(state.measures.config).reduce((prev, curr) => prev + Number(curr.liveData), 0) > 0,
  // );

  React.useEffect(() => {
    if (error) {
      dispatch(actions.measuresApiErrorReceived({ error: error.message }));
    }
    if (data && !fetchingList) {
      dispatch(actions.pushMeasure({ ...data.newMeasurement, origin: 'live' }));
    }
  }, [data, error, dispatch, fetchingList]);

  const classes = useStyles();

  if (fetchingList) {
    return (
      <Container fixed className={classes.container}>
        <Grid container justify="center" alignItems="center">
          <CircularProgress size={100} />
        </Grid>
      </Container>
    );
  }

  return (
    <Container fixed className={classes.container}>
      <Grid container direction="row" justify="space-around" alignItems="flex-start">
        {metricList.map(metricName => (
          <MeasureTile metricName={metricName} key={metricName} />
        ))}
      </Grid>
    </Container>
  );
};

export default MeasureTiles;
