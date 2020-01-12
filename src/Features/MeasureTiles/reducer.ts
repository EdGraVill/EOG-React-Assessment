import { createSlice, PayloadAction } from 'redux-starter-kit';
import { ApiErrorAction } from './saga';

export interface Measure {
  metric: string;
  at: number;
  value: number;
  unit: string;
}

export interface NewMeasure extends Measure {
  origin: 'live' | 'update';
}

export interface ChangeBooleanConfig {
  metric: string;
  configName: 'liveData' | 'anotherBooleanConfig';
  value: boolean;
}
export interface ChangeStringConfig {
  metric: string;
  configName: 'stringConfig';
  value: string;
}
export interface ChangeNumberConfig {
  metric: string;
  configName: 'numberConfig';
  value: number;
}

type ChangeConfig = ChangeBooleanConfig | ChangeNumberConfig | ChangeStringConfig;

export interface MeasureState {
  metricList: string[];
  latestMeasure: {
    [metric: string]: Measure;
  };
  measureList: {
    [metric: string]: {
      [time: number]: Measure;
    };
  };
  config: {
    [metric: string]: {
      liveData: boolean;
      stringConfig: string; // This is an example
      numberConfig: number; // This is an example
      anotherBooleanConfig: boolean; // This is an example
    };
  };
}

const initialState: MeasureState = {
  metricList: [],
  latestMeasure: {},
  measureList: {},
  config: {},
};

const slice = createSlice({
  initialState,
  name: 'measures',
  reducers: {
    updateMetricList: (state, action: PayloadAction<string[]>) => {
      state.metricList = action.payload;

      // I also set the measure list to avoid errors like: "foo.bar is undefined"
      state.measureList = action.payload.reduce(
        (prev, curr) => ({ ...prev, [curr]: state.measureList[curr] || {} }),
        {},
      );
      state.config = action.payload.reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: {
            liveData: false,
            stringConfig: '',
            numberConfig: 0,
            anotherBooleanConfig: false,
          },
        }),
        {},
      );
    },
    pushMeasure: (state, action: PayloadAction<NewMeasure>) => {
      const { at, metric } = action.payload;
      const { origin, ...metricData } = action.payload;

      // Store the result. I used object type instead array to avoid duplicity
      state.measureList[metric] = {
        [at]: metricData,
        ...state.measureList[metric],
      };

      // Check if is first entry
      const existLatestMeasure = state.latestMeasure[metric];
      // Check if should update live
      const isLiveOrIsUpdate = origin === 'update' || state.config[metric].liveData;
      // Check if is newest respect latest
      const isNewest = existLatestMeasure && existLatestMeasure.at < at;

      /**
       * NOTE: I splited logic into variables for 3 reasons:
       *
       * 1) Verbosity is always better in development, there're a lot of process that reduce that verbosity in the final build
       * 2) Is human readable store logic
       * 3) Reusability. I would be something like: if (!state.latestMeasure[metric] || (state.latestMeasure[metric] && state.latestMeasure[metric].at < at))
       *    or even with the new js features: if (!state.latestMeasure[metric] || (state.latestMeasure?[metric].at < at)) anyway, is too long and hard to follow
       */

      if (!existLatestMeasure || (isLiveOrIsUpdate && isNewest)) {
        state.latestMeasure[metric] = metricData;
      }
    },
    updateConfig: (state, action: PayloadAction<ChangeConfig>) => {
      const { configName, metric, value } = action.payload;

      if (Object.keys(state.config[metric]).includes(configName)) {
        state.config[metric][configName] = value as never; // Weird ts thing
      }
    },
    measuresApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const { actions, reducer, name } = slice;
