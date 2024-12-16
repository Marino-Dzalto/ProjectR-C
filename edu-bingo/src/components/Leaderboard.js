import React, { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard'); // zamijeni sa svojim API-em
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboard(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load leaderboard.');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      {leaderboard.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <ol className="leaderboard-list">
          {leaderboard.map((player, index) => (
            <li key={index}>
              <span>{player.name}</span>
              <span>{player.score} points</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;
