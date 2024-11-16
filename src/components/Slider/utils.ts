export function generateSampleTimestamps(count = 5): number[] {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  return Array.from({ length: count }, (_, i) => now - (count - 1 - i) * oneDay);
}

// Simplified version of the slider data generation
export function generateSliderData(data: number[]) {
  if (!data.length) {
    // Provide default data if none is provided
    data = generateSampleTimestamps();
  }

  return {
    gaps: [],  // Simplified version doesn't handle gaps
    dataByGapsPositions: [{ start: 0, end: 100 }],
    valueToPosition: (value: number) => {
      const min = data[0];
      const max = data[data.length - 1];
      if (value >= max) return 100;
      if (value <= min) return 0;
      return ((value - min) / (max - min)) * 100;
    },
    positionToValue: (position: number) => {
      const min = data[0];
      const max = data[data.length - 1];
      if (position >= 100) return max;
      if (position <= 0) return min;
      return min + (position / 100) * (max - min);
    }
  };
}
