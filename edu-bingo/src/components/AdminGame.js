// src/components/AdminGame.js

import React, { useState, useEffect } from 'react';
import './AdminGame.css';

const AdminGame = ({ adminData }) => {
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState([]);
  // const [selectedLesson, setSelectedLesson] = useState(''); // Ova linija uzrokuje warning
  // const lessons = [
  //   "Priroda i društvo",
  //   "Matematika",
  //   "Programiranje",
  //   "Povijest",
  //   "Geografija",
  //   "Likovni",
  //   "Fizika"
  // ];

  // const addPlayer = (playerName) => { // Ova linija uzrokuje warning
  //   setPlayers((prevPlayers) => [...prevPlayers, playerName]);
  // };

  useEffect(() => {
    // Generiranje slučajnog koda igre kada se komponenta učita
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameCode(generatedCode);
  }, []);

  return (
    <div className="admin-game">
      <h1>EduBingo</h1>
      <div className="game-code">
        <h2>Šifra igre: {gameCode}</h2>
      </div>
      <div className="player-list">
        <h2>Igrači:</h2>
        <ul>
          {players.length > 0 ? (
            players.map((player, index) => (
              <li key={index}>{player}</li>
            ))
          ) : (
            <li>Nema igrača u igri.</li>
          )}
        </ul>
      </div>
      <div className="lessons-menu">
        <h2>Odabir predmeta:</h2>
        <select onChange={(e) => { /* setSelectedLesson(e.target.value) */ }}>
          <option value="">Odaberite lekciju</option>
          {/* {lessons.map((lesson, index) => (
            <option key={index} value={lesson}>{lesson}</option>
          ))} */}
        </select>
      </div>
      {/* Ovdje bi dodali logiku za započinjanje igre */}
      <button onClick={() => {/* logika za započinjanje igre */}}>Započni igru</button>
    </div>
  );
};

export default AdminGame;
