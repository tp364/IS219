import React, { useState } from 'react';
import CityChart from './components/CityChart';
import Calculator from './components/Calculator';

export default function App() {
  const [view, setView] = useState<'chart' | 'calculator'>('chart');

  return (
    <div>
      <h1>Can Recent Graduates Afford to Buy a House?</h1>
      <nav>
        <button onClick={() => setView('chart')} disabled={view === 'chart'}>
          Affordability Chart
        </button>
        <button onClick={() => setView('calculator')} disabled={view === 'calculator'}>
          Calculator
        </button>
      </nav>
      {view === 'chart' ? <CityChart /> : <Calculator />}
    </div>
  );
}
