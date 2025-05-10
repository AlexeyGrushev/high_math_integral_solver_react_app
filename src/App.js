import React, { useState } from 'react';
import TripleIntegralForm from './components/TripleIntegralForm';
import RegionVisualizer from './components/RegionVisualizer';

function App() {
  const [result, setResult] = useState(null);
  const [bounds, setBounds] = useState({
    xMin: '0', xMax: '1',
    yMin: '0', yMax: '1',
    zMin: '0', zMax: '1'
  });

  const handleResult = (val, boundsUsed) => {
    setResult(val);
    setBounds(boundsUsed);
  };

  return (
    <div style={{ display: 'box', gap: '40px', padding: '20px' }}>
      <RegionVisualizer bounds={bounds} />
      <hr/>
      <div>
        <TripleIntegralForm onResult={handleResult} />
        {result && <h2>Результат: {result}</h2>}
      </div>
    </div>
  );
}

export default App;
