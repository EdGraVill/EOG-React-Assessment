import * as React from 'react';
import { Chart, ChartData, ChartDataSets } from 'chart.js';
import { useSelector } from 'react-redux';
import { Measure } from './reducer';
import { titles } from './MeasureTile';
import { Store } from '../../store';

const twoDigits = (n: number) => (n / 100).toFixed(2).split('.')[1];
const toLabel = (at: number): string => {
  const date = new Date(at);

  return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`;
};

const colorList = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
};
const backgroundList = {
  red: 'rgb(255, 99, 132, .3)',
  orange: 'rgb(255, 159, 64, .3)',
  yellow: 'rgb(255, 205, 86, .3)',
  green: 'rgb(75, 192, 192, .3)',
  blue: 'rgb(54, 162, 235, .3)',
  purple: 'rgb(153, 102, 255, .3)',
  grey: 'rgb(201, 203, 207, .3)',
};

const parseData = (data: Measure[], related?: Measure[][]): ChartData => {
  if (data.length) {
    const { metric, unit } = data[0];
    const labels = data.map(measure => toLabel(measure.at));

    const parsedRelated =
      related && related.length
        ? related.map(
            (rel, ix): ChartDataSets => {
              return {
                label:
                  rel[0].unit === 'F' ? `${titles[rel[0].metric]} in °F` : `${titles[rel[0].metric]} in ${rel[0].unit}`,
                data: rel.map(({ value }) => value),
                hidden: true,
                pointStyle: 'line',
                borderColor: Object.values(colorList)[ix + 1],
                backgroundColor: Object.values(backgroundList)[ix + 1],
              };
            },
          )
        : [];

    const datasets: ChartDataSets[] = [
      {
        label: unit === 'F' ? `${titles[metric]} in °F` : `${titles[metric]} in ${data[0].unit}`,
        data: data.map(({ value }) => value),
        pointStyle: 'line',
        borderColor: Object.values(colorList)[0],
        backgroundColor: Object.values(backgroundList)[0],
      },
      ...parsedRelated,
    ];

    return {
      datasets,
      labels,
    };
  }

  return {
    datasets: [],
    labels: [],
  };
};

const loadChart = (data: Measure[], canvas: HTMLCanvasElement, related?: Measure[][]): Chart | null => {
  const ctx = canvas.getContext('2d');

  if (ctx) {
    return new Chart(ctx, {
      type: 'line',
      data: parseData(data, related),
      options: {
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 3,
              },
            },
          ],
        },
      },
    });
  }

  return null;
};

const extractData = (metricName: string, ammount: number) => (store: Store): Measure[] => {
  const measureList = store.measures.measureList[metricName];

  return Object.keys(measureList)
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, ammount)
    .map((at: string) => measureList[Number(at)]);
};

const extractRelatedData = (metricName: string, ammount: number) => (store: Store): Measure[][] => {
  const ownUnit = Object.values(store.measures.measureList[metricName])[0].unit;
  const relateds = Object.keys(store.measures.measureList).filter(mn => {
    const isSameUnit = mn !== metricName && Object.values(store.measures.measureList[mn])[0].unit === ownUnit;

    return isSameUnit;
  });

  if (!relateds.length) {
    return [];
  }

  return relateds.map(relatedMetricName => {
    const measureList = store.measures.measureList[relatedMetricName];

    return Object.keys(measureList)
      .sort((a, b) => Number(b) - Number(a))
      .slice(0, ammount)
      .map((at: string) => measureList[Number(at)]);
  });
};

const useChart = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  metricName: string,
): [number, (ev: React.ChangeEvent<{}>, value: number | number[]) => void, Chart | null] => {
  const [chart, setChart] = React.useState<Chart | null>(null);
  const [ammount, setAmmount] = React.useState<number>(40);

  const changeAmmount = (ev: React.ChangeEvent<{}>, value: number | number[]) => {
    if (ammount !== value) {
      setAmmount(value instanceof Array ? value[0] : value);
    }
  };

  const data = useSelector<Store, Measure[]>(extractData(metricName, ammount));
  const related = useSelector<Store, Measure[][]>(extractRelatedData(metricName, ammount));

  // This effect add new result to the chart and deletes last
  React.useEffect(() => {
    if (canvasRef.current && !chart) {
      // Set a new chart if there isn't a chart
      setChart(loadChart(data, canvasRef.current, related));
    } else if (chart && data) {
      // If the result is new
      const isNew = toLabel(data[0].at) !== chart.data.labels![chart!.data.labels!.length - 1];

      if (isNew) {
        const labels = chart.data.labels!;
        const currentData = chart.data.datasets![0].data!;

        labels.push(toLabel(data[0].at));
        currentData.push(data[0].value);

        if (currentData.length > ammount) {
          labels.shift();
          currentData.shift();
        }
      }

      if (related && related.length) {
        related.forEach((rel, ix) => {
          const isNewRel = toLabel(rel[0].at) !== chart.data.labels![chart!.data.labels!.length - 1];

          if (isNewRel) {
            const currentData = chart.data.datasets![ix + 1].data!;
            currentData.push(rel[0].value);

            if (currentData.length > ammount) {
              currentData.shift();
            }
          }
        });
      }

      chart.update();
    }
  }, [canvasRef, data, chart, ammount, related]);

  // This effect is for update the ammount of results displayed in the chart
  React.useEffect(() => {
    if (chart && chart.data.labels!.length !== ammount) {
      const incomingData = parseData(data, related);

      chart.data.labels = incomingData.labels;
      chart.data.datasets = incomingData.datasets;

      chart.update();
    }
  }, [ammount, chart, data, related]);

  return [ammount, changeAmmount, chart];
};

export default useChart;
