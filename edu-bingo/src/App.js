// src/App.js

import React, { useEffect, useState } from 'react';
import './App.css';
import AdminGame from './components/AdminGame';
import GameBoard from './components/GameBoard';
import Home from './components/Home';
import Leaderboard from './components/Leaderboard';
import Lobby from './components/Lobby';
import { SocketProvider } from './SocketContext';

const App = () => {
  const [adminData, setAdminData] = useState(null);
  const [adminName, setAdminName] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [players, setPlayers] = useState(null);  // gdje ćemo storeat igrače
  const [isGameLocked, setIsGameLocked] = useState(false); // je li soba zaključana/otključana
  const [isGameStarted, setIsGameStarted] = useState(false); //je li igra započela ili smo još u lobbyu
  const [showLeaderboard, setShowLeaderboard] = useState(false); //pokazivanje leaderboarda
  const [questionData, setQuestionData] = useState([]);

  const handleCreateGame = async (data) => {
    try {
      const verifyResponse = await fetch('/api/verify-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const verifyResult = await verifyResponse.json();

      if(!verifyResponse.ok) {
        alert(verifyResult.message);
        return;
      }

      const response = await fetch('/api/create-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: verifyResult.teacher_id, data }),
      });

      const result = await response.json();

      if (response.ok) {
        setAdminData(result); // room podaci potrebni za sobu
        setIsGameLocked(false); // inicijalno je soba otvorena...
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleLeaveLobby = () => {
    setGameCode(null);
    setIsGameStarted(false);
  };

  const handleStartGame = (data) => {
    setQuestionData(data);
    setIsGameStarted(true);
  }

  const handleEndGame = () => {
    setIsGameStarted(false);
    setShowLeaderboard(true);
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
    //  setPlayers([
    //  { name: 'Player1' },
    //  { name: 'Player2' },
    //  { name: 'Player3' },]);
    //setShowLeaderboard(true);
    //setScores([100, 90, 80]);

    //Home
  }, []);

  return (
    <SocketProvider>
      <div className="App">
        {isGameStarted ? (
          // Ako je igra krenula idemo na GameBoard
          <GameBoard questionData={questionData} onEndGame={handleEndGame} />
        ) : adminData && !showLeaderboard ? (
          // Ako adminData imamo, a Game code jos ne onda mi pokaži AdminGame(teacher dio)
          <AdminGame adminData={adminData} onEndGame={handleEndGame} />
        ) : showLeaderboard ? (
          <Leaderboard gameId={adminData ? adminData.game_id : questionData.game_id} />
        ) : players ? (
          // Ako je izgeneriran code, ali igra još nije krenla onda smo još u Lobbyu
          <Lobby
            gameCode={gameCode}
            adminName={adminName}
            players={players}
            onLeaveLobby={handleLeaveLobby}
            isGameLocked={isGameLocked}
            onStartGame={handleStartGame}
          />
        ) : (
          // Pokaži index po defaultu
          <Home onCreateGame={handleCreateGame} setPlayers={setPlayers} setGameCode={setGameCode} setAdminName={setAdminName}/>
        )}
      </div>
    </SocketProvider>
  );
};

export default App;
