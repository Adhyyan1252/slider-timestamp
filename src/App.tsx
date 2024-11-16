import { useState } from 'react';
import './App.css';
import { Slider } from './components/Slider/Slider';
import { generateSampleTimestamps, generateSliderData } from './components/Slider/utils';

function App() {
  const [value, setValue] = useState<number>(Date.now());
  const timestamps = generateSampleTimestamps(5); // Generate 5 sample timestamps

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-2xl font-bold">Slider Interview Component</h1>
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <Slider
            value={value}
            onChange={handleChange}
            data={generateSliderData(timestamps)}
          />
          <div className="mt-4 text-sm text-gray-600">
            Current Value: {new Date(value).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
