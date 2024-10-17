// src/components/Home.js

import React, { useState } from 'react';

const Home = ({ onCreateGame, onJoinGame }) => {
  const [adminName, setAdminName] = useState('');
  const [adminSurname, setAdminSurname] = useState('');
  const [numPlayers, setNumPlayers] = useState('');
  const [gameCode, setGameCode] = useState('');

  const handleStartGame = () => {
    if (adminName && adminSurname && numPlayers) {
      onCreateGame({ adminName, adminSurname, numPlayers });
    }
  };

  const handleJoinGame = () => {
    if (gameCode) {
      onJoinGame(gameCode);
    } else {
      alert("Unesite šifru za ulazak u igru.");
    }
  };

  return (
    <div className="home">
      <h1>EduBingo</h1>
      <div className="admin-info">
        <h2>Kreiraj igru</h2>
        <input 
          type="text" 
          placeholder="Ime admina" 
          value={adminName} 
          onChange={(e) => setAdminName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Prezime admina" 
          value={adminSurname} 
          onChange={(e) => setAdminSurname(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Broj igrača" 
          value={numPlayers} 
          onChange={(e) => setNumPlayers(e.target.value)} 
        />
        <button onClick={handleStartGame}>Start Game</button>
      </div>
      <div className="join-game">
        <h2>Pridruži se igri</h2>
        <input 
          type="text" 
          placeholder="Šifra igre" 
          value={gameCode} 
          onChange={(e) => setGameCode(e.target.value)} 
        />
        <button onClick={handleJoinGame}>Start</button>
      </div>
    </div>
  );
};

export default Home;
