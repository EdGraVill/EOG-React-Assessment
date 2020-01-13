import * as React from 'react';
import { CardContent, Slider, FormGroup, FormControlLabel } from '@material-ui/core';
import useChart from './useChart';

interface ChartProps {
  metricName: string;
}

const ChartMeasure: React.FC<ChartProps> = ({ metricName }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [ammount, changeAmmount] = useChart(canvasRef, metricName);

  const SliderInput = (
    <Slider
      defaultValue={ammount}
      aria-labelledby="discrete-slider"
      valueLabelDisplay="auto"
      marks
      step={10}
      min={10}
      max={150}
      onChange={changeAmmount}
    />
  );

  return (
    <CardContent>
      <canvas ref={canvasRef} />
      <FormGroup>
        <FormControlLabel control={SliderInput} label="Results Threshold" labelPlacement="top" />
      </FormGroup>
    </CardContent>
  );
};

export default ChartMeasure;
