// src/components/AdminGame.js

import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useEffect, useState } from 'react';
import { useSocket } from '../SocketContext';
import '../styles/AdminGame.css';

const AdminGame = ({ adminData, onEndGame }) => {
  const [playerList, setPlayerList] = useState([]);
  const [subjects, setSubjects] = useState([]);// predmeti s backenda
  const [selectedSubject, setSelectedSubject] = useState('');// trenutacni predmet
  const [topics, setTopics] = useState([]);// teme s backenda
  const [selectedTopic, setSelectedTopic] = useState('');//trenutacna tema
  const socket = useSocket();

  // Fetchamo subjects iz backenda
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');  // treba namjestit enrpoin
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        } else {
          console.error('Failed to fetch subjects');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]); // ako predmet nije izabran brisemo i teme
      return;
    }

    const fetchTopics = async () => {
      try {
        const response = await fetch(`/api/topics?subject=${selectedSubject.subject_id}`); // Treba namjestit endpoint
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        } else {
          console.error('Failed to fetch topics');
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    if (socket) {

      socket.emit('adminJoin', {"game_id": adminData.game_id})

      const handleUpdatePlayers = (data) => {
        if (data && data.players) {
          setPlayerList(data.players);
        }
      };

      socket.on("updatePlayers", handleUpdatePlayers);
      socket.on('gameEnded', () => {
        onEndGame();
      })

      return () => {
        socket.off('updatePlayers');
        socket.off('gameEnded');
      };
    }
  }, [socket, adminData, onEndGame]);

   // Handle game creation nakon sta izaberemo temu i predmet
   const handleCreateGame = async () => {
    if (!selectedSubject || !selectedTopic) {
      alert('Izaberite i predmet i temu!');
      return;
    }

    try {
      const setTopicResponse = await fetch(`/api/set-topic/${adminData.game_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: selectedTopic })
      });

      if (!setTopicResponse.ok) {
        console.error('Greška pri postavljanju teme');
        return;
      }

      const lockGameResponse =  await fetch(`/api/lock-room/${adminData.game_id}`, { method: 'POST' });

      if (lockGameResponse.ok) {
        console.log('Igra je uspješno napravljena');
        socket.emit("startGame", {
          room_id: adminData.game_id,
          selectedTopic,
        });
      } else {
        console.error('Igra nije napravljena');
      }
    } catch (error) {
      console.error('Greška pri pravljenju igre!', error);
    }
  };

  return (
    <div className="admin-game">
      <div className="clouds">
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
        <div className="cloud"><i className="fas fa-cloud"></i></div>
      </div>
      <div className="tijelo">
        <h1><i className="fas fa-graduation-cap"></i>EduBingo</h1>
        <div className="game-setup">
          <label>
            Predmet:
            <select value={selectedSubject.name} onChange={(e) => {
              const selected = subjects.find(s => s.name === e.target.value)
              setSelectedSubject(selected);
              }}
            >
              <option value="">Izaberite predmet</option>
              {subjects.map((subj) => (
                <option key={subj.subject_id} value={subj.name}>{subj.name}</option>
              ))}
            </select>
          </label>

          <label>
            Tema:
            <select
              value={selectedTopic.name}
              onChange={(e) => {
                const selected = topics.find(t => t.name === e.target.value)
                setSelectedTopic(selected)
              }}
              disabled={!selectedSubject}
            >
              <option value="">Izaberite temu</option>
              {topics
                .filter((t) => t.subject_id === selectedSubject.subject_id)
                .map((top) => (
                  <option key={top.topic_id} value={top.name}>{top.name}</option>
                ))}
            </select>
          </label>

            <button onClick={handleCreateGame}>Pokreni igru</button>
          </div>

        <div className="game-code">
          <h2>Šifra igre: {adminData.game_code}</h2>
        </div>
        <div className="player-lista">
          <h2>Igrači:</h2>
          <ul>
            {playerList.length > 0 ? (
              playerList.map((player, index) => (
                <li key={index}>{player.name || player}</li>
              ))
            ) : (
              <li>Nema igrača u igri.</li>
            )}
          </ul>
        </div>
      </div>
      
    </div>
  );
};

export default AdminGame;
