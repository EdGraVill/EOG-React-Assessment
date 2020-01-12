import { spawn } from 'redux-saga/effects';
import weatherSaga from '../Features/MeasureTiles/saga';

export default function* root() {
  yield spawn(weatherSaga);
}
