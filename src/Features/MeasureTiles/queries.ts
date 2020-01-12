import { Measure } from './reducer';

export const getMetricsQuery = `
  query {
    getMetrics
  }
`;

export interface GetMetricsResult {
  getMetrics: string[];
}

export const newMeasurementSubscription = `
  subscription {
    newMeasurement {
      metric
      at
      value
      unit
    }
  }
`;

export interface NewMeasurementResult {
  newMeasurement: Measure;
}

export const getLastKnownMeasurementQuery = `
  query($metricName: String!) {
    getLastKnownMeasurement(metricName: $metricName) {
      metric
      at
      value
      unit
    }
  }
`;

export interface GetLastKnownMeasurementResult {
  getLastKnownMeasurement: Measure;
}
