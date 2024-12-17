// src/App.js

import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import AdminGame from './components/AdminGame';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import AdminProfile from './components/AdminProfile';
import Leaderboard from './components/Leaderboard';
import './App.css';

const App = () => {
  const [adminData, setAdminData] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [players, setPlayers] = useState([]);  // gdje ćemo storeat igrače
  const [isGameLocked, setIsGameLocked] = useState(false); // je li soba zaključana/otključana
  const [isGameStarted, setIsGameStarted] = useState(false); //je li igra započela ili smo još u lobbyu
  const [showLeaderboard, setShowLeaderboard] = useState(false); //pokazivanje leaderboarda
  const [scores, setScores] = useState([]);


  const handleCreateGame = async (data) => {
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setAdminData(result); // room podaci potrebni za sobu
      setIsGameLocked(false); // inicijalno je soba otvorena...
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = async (code, playerData) => {
    try {
      const response = await fetch(`/api/join-room/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      const result = await response.json();
      setGameCode(code);
      setPlayers(result.players); // inicijalna lista za postavljanje igrača
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleLeaveLobby = () => {
    setGameCode(null);
    setIsGameStarted(false);
  };

  const handleStartGame = async () => {
    try {
      await fetch(`/api/lock-room/${gameCode}`, { method: 'POST' });
      setIsGameLocked(true); // lockamo sobu, igra kreće, ne može se nitko više pridružiti
      setIsGameStarted(true);
    } catch (error) {
      console.error('Error locking the game:', error);
    }
  };

  // Fetch leaderboard data from the backend
  const fetchLeaderboard = async (gameCode) => {
    try {
      const response = await fetch(`/api/leaderboard/${gameCode}`);
      if (!response.ok) {
        throw new Error(`Error fetching leaderboard: ${response.statusText}`);
      }
      const data = await response.json();

      // Update players and scores
      setPlayers(data.map((player) => ({ name: player.name })));
      setScores(data.map((player) => player.score));
      setShowLeaderboard(true);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const handleEndGame = () => {
    setIsGameStarted(false);
    fetchLeaderboard(gameCode);
  };


  useEffect(() => {
    // Da bismo testirali pojedinu stranicu samo uncommentaj pojedini dio
    // AdminGame
    //setAdminData({ roomId: '123', roomName: 'Test Room' });

    // Lobby
    //setGameCode('123');
    //setPlayers([{ name: 'Player1' }, { name: 'Player2' }]);

    // GameBoard
    //setIsGameStarted(true);
    //setPlayers([{ name: 'Player1' }, { name: 'Player2' }]);
    //setGameCode('123');


    // Leaderboard
    // Uncomment the following to test Leaderboard page
    //  setPlayers([
    //  { name: 'Player1' },
    //  { name: 'Player2' },
    //  { name: 'Player3' },]);
    //setShowLeaderboard(true);
    //setScores([100, 90, 80]);


    //Home
    //samo zakomentiraj sve
  }, []);

  return (
    <div className="App">
      {showLeaderboard ? (
        <Leaderboard players={players} scores={scores} />
      ) : isGameStarted ? (
        <GameBoard players={players} gameCode={gameCode} onEndGame={handleEndGame} />
      ) : gameCode ? (
        // Ako je izgeneriran code, ali igra još nije krenla onda smo još u Lobbyu
        <Lobby
          gameCode={gameCode}
          players={players}
          onLeaveLobby={handleLeaveLobby}
          isGameLocked={isGameLocked}
        />
      ) : adminData ? (
        // Ako adminData imamo, a Game code jos ne onda mi pokaži AdminGame(teacher dio)
        <AdminGame
          adminData={adminData}
          onStartGame={handleStartGame}
        />
      ) : (
        // Pokaži index po defaultu
        <Home onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
      )}
    </div>
  );
};

export default App;
