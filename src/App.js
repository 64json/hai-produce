import React, { useState } from 'react';
import './App.scss';
import Main from './Main';
import Dashboard from './Dashboard';
import { FarmContext } from './common';
import mockFarm from './farm.json';

function App() {
  const [farm, setFarm] = useState(undefined);

  return (
    <div className="App">
      <FarmContext.Provider value={[farm, setFarm]}>
        {
          farm === undefined ? (
            <Main/>
          ) : (
            <Dashboard/>
          )
        }
      </FarmContext.Provider>
    </div>
  );
}

export default App;
