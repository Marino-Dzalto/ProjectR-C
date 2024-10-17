// src/App.js

import React, { useState } from 'react';
import Home from './components/Home';
import AdminGame from './components/AdminGame';
import './App.css';

const App = () => {
  const [adminData, setAdminData] = useState(null);

  const handleCreateGame = (data) => {
    setAdminData(data);
  };

  return (
    <div className="App">
      {adminData ? (
        <AdminGame adminData={adminData} />
      ) : (
        <Home onCreateGame={handleCreateGame} />
      )}
    </div>
  );
};

export default App;
