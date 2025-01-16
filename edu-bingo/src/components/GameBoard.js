import React, { useEffect, useState } from 'react';
import mickey from "../mickey.png";
import minnie from "../minnie.png";
import { useSocket } from '../SocketContext';
import { useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import '../styles/GameBoard.css';
import { faCheck } from '@fortawesome/free-solid-svg-icons'; 

const GameBoard = ({ questionData }) => {
  const [cards, setCards] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate(); // Navigation for redirection

  // Generate 9 unique numbers
  const generateUniqueCardNumbers = (count) => {
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < count) {
      const randomNumber = Math.floor(Math.random() * 90) + 1;
      uniqueNumbers.add(randomNumber);
    }
    return Array.from(uniqueNumbers);
  };

  useEffect(() => {
    if (!questionData) {
      console.error('questionData is undefined or null');
      return;
    }
    const uniqueCardNumbers = generateUniqueCardNumbers(9);

    const initialCards = questionData.questions.slice(0, 9).map((question, index) => ({
      id: index,
      task_id: question.task_id,
      number: uniqueCardNumbers[index],
      task: question,
      flipped: false
    }));

    setCards(initialCards);
  }, [questionData]);

  const generateRandomNumber = () => {
    setRandomNumber(Math.floor(Math.random() * 90) + 1);
  };

  useEffect(() => {
    if (!socket) {
      console.error('Socket is not available');
      return;
    }

    const handleNewQuestion = (data) => {
      const new_q = data.new_question;
      const old_q = data.old_question;

      if (!cards) {
        console.error('cards state is undefined');
        return;
      }
      
      const updatedCards = cards.map((card) => 
        card.task_id === old_q ? { ...card, task_id: new_q.task_id, task: new_q } : card
      );

      setCards(updatedCards);
    };

    const handleGameEnded = (data) => {
      console.log(data.winner + " won!!");
      console.log('Game ended, attempting redirect via gameEnded event');
      if (questionData && questionData.game_id) {
        navigate(`/leaderboard/${questionData.game_id}`);
      } else {
        console.error('questionData or game_id is missing for navigation');
      }
    };

    // New listener for redirection
    const handleRedirect = () => {
      console.log('Redirect event received'); 
      console.log('Attempting to navigate to leaderboard via redirect event');
      if (questionData && questionData.game_id) {
        navigate(`/leaderboard/${questionData.game_id}`);
      } else {
        console.error('questionData or game_id is missing for navigation');
      }
    };

    socket.on('receiveNewQuestion', handleNewQuestion);
    socket.on('gameEnded', handleGameEnded);
    socket.on('redirectToNextPage', handleRedirect);

    return () => {
      socket.off('receiveNewQuestion', handleNewQuestion);
      socket.off('gameEnded', handleGameEnded);
      socket.off('redirectToNextPage', handleRedirect);
    };
  }, [cards, socket, navigate, questionData]);

  // When a player collects 18 points, victory is automatically awarded
  useEffect(() => {
    if (score >= 18) {
      console.log(`Player reached 18 points. Emitting 'endGame' event.`);
      if (questionData && questionData.game_id) {
        socket.emit('endGame', { room_id: questionData.game_id });
      } else {
        console.error('questionData or game_id is missing for emitting endGame');
      }
    }
  }, [questionData, score, socket]);

  // When a player answers
  const handleSubmitAnswer = () => {
    const card = cards[selectedCardIndex];
    if (!card) {
      console.error('Selected card does not exist');
      return;
    }

    const isCapsSensitive = questionData && questionData.topic_id === "56c3f768-8e47-456b-9d81-9a6eaf375940";

    const isCorrect =
      (card.task.answer.type === 'written' &&
        (isCapsSensitive
          ? answer === card.task.answer.correct_answer // Case-sensitive comparison
          : answer.toLowerCase() === card.task.answer.correct_answer.toLowerCase())) ||
      (card.task.answer.type === 'numerical' && Number(answer) === card.task.answer.correct_answer) ||
      (card.task.answer.type === 'multiple choice' && answer === card.task.answer.correct_answer);

    if (isCorrect) {
      let points = 0;
      if (card.task.difficulty === 'high') {
        points = 3;
      } else if (card.task.difficulty === 'medium') {
        points = 2;
      } else if (card.task.difficulty === 'easy') {
        points = 1;
      }

      setScoreAnimation(`+${points}`);
      setTimeout(() => setScoreAnimation(null), 1000);
      setScore(prevScore => prevScore + points);

      setCards(prevCards =>
        prevCards.map((c, i) =>
          i === selectedCardIndex ? { ...c, completed: true } : c
        )
      );

      if (socket) {
        console.log('Emitting "playerAnswered" with score:', points);
        socket.emit('playerAnswered', { task_id: card.task_id, game_id: questionData.game_id, score: points });
      }
    } else {
      if (socket) {
        console.log('Emitting "changeQuestion" for incorrect answer');
        socket.emit('changeQuestion', { task_id: card.task_id, difficulty: card.task.difficulty, game_id: questionData.game_id, topic_id: questionData.topic_id });
      }
    }

    setAnswer('');
    setSelectedCardIndex(null);
  };

  // BINGOBINGO recognition
  const handleBingo = () => {
    if (answer.toUpperCase() === "XXX") {
      setScore(18);
      setScoreAnimation("+18");
      setTimeout(() => setScoreAnimation(null), 1000);
      if (socket) {
        console.log('Bingo recognized, emitting "endGame"');
        socket.emit('endGame', { room_id: questionData.game_id });
      }
    }
  };

  const closeModal = () => {
    setSelectedCardIndex(null);
    setAnswer('');
  };

  return (
    <div className="game-board">
      <div className="game-info">
        <h2>
          Score: {score}
          {scoreAnimation && <span className="score-animation">{scoreAnimation}</span>}
        </h2>
        <button onClick={generateRandomNumber}>Novi broj</button>
        {randomNumber && <p>Moj novi broj {randomNumber}</p>}
      </div>

      <div className="card-grid">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card ${card.flipped ? 'flipped' : ''}`}
            onClick={() => setSelectedCardIndex(index)}
          >
            <p>{card.completed ? <FontAwesomeIcon icon={faCheck} className="icon-check" /> : `Redni broj: ${card.number}`}</p>
          </div>
        ))}
      </div>

      {/* Mickey and Minnie */}
      <div className="character">
        <div className="minnie">
          <img src={minnie} alt="Minnie pic"/>
        </div>
        <div className="mickey">
          <img src={mickey} alt="Mickey pic"/>
        </div>
      </div>

      {/* Modal for opening question window */}
      {selectedCardIndex !== null && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>×</span>
            <p>{cards[selectedCardIndex].task.question}</p>
            {!cards[selectedCardIndex].completed && (
              <>
                {cards[selectedCardIndex].task.answer.type === 'written' && (
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onBlur={handleBingo}  // Check for BINGOBINGO when leaving input
                  />
                )}
                {cards[selectedCardIndex].task.answer.type === 'numerical' && (
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onBlur={handleBingo}  // Check for BINGOBINGO when leaving input
                  />
                )}
                {cards[selectedCardIndex].task.answer.type === 'multiple choice' && (
                  <div className="options-container">
                    {['a', 'b', 'c'].map((letter) => (
                      <div
                        key={letter}
                        className={`option-box ${answer === letter ? 'selected' : ''}`}
                        onClick={() => setAnswer(letter)}
                      >
                        {cards[selectedCardIndex].task.answer[`option_${letter}`]}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleSubmitAnswer}>Potvrdi odgovor</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
