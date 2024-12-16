import React, { useEffect, useState } from 'react';
import '../styles/AdminProfile.css';

const AdminProfile = () => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const response = await fetch('/api/admin/quiz-history'); // zamijeni sa svojim API-em
        if (!response.ok) {
          throw new Error('Failed to fetch quiz history');
        }
        const data = await response.json();
        setQuizHistory(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz history.');
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-profile">
      <h1>Admin Profile</h1>
      <h2>Quiz History</h2>
      {quizHistory.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        <ul className="quiz-list">
          {quizHistory.map((quiz) => (
            <li key={quiz.id}>
              <h3>Quiz Code: {quiz.code}</h3>
              <p>Date: {new Date(quiz.date).toLocaleDateString()}</p>
              <p>Players:</p>
              <ul>
                {quiz.players.map((player, index) => (
                  <li key={index}>{player.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminProfile;
