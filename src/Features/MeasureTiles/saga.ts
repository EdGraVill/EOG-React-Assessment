import { takeEvery, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { PayloadAction } from 'redux-starter-kit';
import { actions } from './reducer';

export type ApiErrorAction = {
  error: string;
};

function* apiErrorReceived(action: PayloadAction<ApiErrorAction>) {
  yield call(toast.error, `Error Received: ${action.payload.error}`);
}

export default function* watchApiError() {
  yield takeEvery(actions.measuresApiErrorReceived.type, apiErrorReceived);
}
