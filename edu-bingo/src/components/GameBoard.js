import React, { useEffect, useState } from 'react';
import mickey from "../mickey.png";
import minnie from "../minnie.png";
import { useSocket } from '../SocketContext';
import { useNavigate } from 'react-router-dom';  // Importiramo useNavigate za preusmjeravanje
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Provjeri da je ovo prisutno
import '../styles/GameBoard.css';
import { faCheck } from '@fortawesome/free-solid-svg-icons'; // Dodaj ovaj import

const GameBoard = ({ questionData }) => {
  const [cards, setCards] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate();  // Inicijaliziramo navigate

  //izgeneriramo 9 jedinstvenih brojeva
  const generateUniqueCardNumbers = (count) => {
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < count) {
      const randomNumber = Math.floor(Math.random() * 90) + 1;
      uniqueNumbers.add(randomNumber);
    }
    return Array.from(uniqueNumbers);
  };

  useEffect(() => {
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
    if (socket) {
      const handleNewQuestion = (data) => {
        const new_q = data.new_question;
        const old_q = data.old_question;

        const updatedCards = cards.map((card) => 
          card.task_id === old_q ? { ...card, task_id: new_q.task_id, task: new_q } : card
        );

        setCards(updatedCards);
      };

      socket.on('receiveNewQuestion', handleNewQuestion);

      // samo privremeni listener da se printa pobjednik kad se dojavi tko je pobijedio
      socket.on('gameEnded', (data) => {
        console.log(data.winner + " won!!");
        
        // Prikazujemo poruku na ekranu kad igrač osvoji Bingo
        // 4 sekunde nakon toga preusmjeravamo na Leaderboard
        setTimeout(() => {
          navigate('/leaderboard');  // Preusmjeravamo na leaderboard
        }, 4000);
      });

      return () => {
        socket.off('receiveNewQuestion', handleNewQuestion);
      };
    }
  }, [cards, socket, navigate]);  // Dodajemo navigate u zavisnosti

  // kada igrac skupi 18 bodova popunio je karticu i mora obavijestiti svih da je pobijedio, uz to i zavrsiti igru
  useEffect(() => {
    if (score >= 18) {
      socket.emit('endGame', { room_id: questionData.game_id });
    }
  }, [questionData.game_id, score, socket]);

  // kad igrač odgovori
  const handleSubmitAnswer = () => {
    // Provjeravamo ako je unesen "BINGOBINGO"
    if (answer.toUpperCase() === "BINGOBINGO") {
      setScore(18); // Dodajemo 18 bodova odmah
      setScoreAnimation("+18"); // Prikazujemo animaciju
  
      // Čekaj 1 sekundu da animacija prođe, pa preusmjeri na Leaderboard
      setTimeout(() => {
        navigate('/leaderboard'); // Preusmjeravamo na leaderboard
      }, 1000); // Pusti da animacija traje 1 sekundu
      return; // Prekida ostatak funkcije jer je igrač već pobijedio
    }
  
    const card = cards[selectedCardIndex];
    if (!card) return;
  
    const isCapsSensitive = questionData.topic_id === "56c3f768-8e47-456b-9d81-9a6eaf375940";
  
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
      setScore((prevScore) => prevScore + points);
  
      setCards((prevCards) =>
        prevCards.map((c, i) =>
          i === selectedCardIndex ? { ...c, completed: true } : c
        )
      );
  
      if (socket) {
        socket.emit('playerAnswered', { task_id: card.task_id, game_id: questionData.game_id, score: points });
      }
    } else {
      if (socket) {
        socket.emit('changeQuestion', { task_id: card.task_id, difficulty: card.task.difficulty, game_id: questionData.game_id, topic_id: questionData.topic_id });
      }
    }
  
    setAnswer('');
    setSelectedCardIndex(null);
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

      {/* Modal za otvaranje prozora pitanja */}
      {selectedCardIndex !== null && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <p>{cards[selectedCardIndex].task.question}</p>
            {!cards[selectedCardIndex].completed && (
              <>
                {cards[selectedCardIndex].task.answer.type === 'written' && (
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                )}
                {cards[selectedCardIndex].task.answer.type === 'numerical' && (
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                )}
                {cards[selectedCardIndex].task.answer.type === 'multiple choice' && (
                  <div className="options-container">
                    {['a', 'b', 'c'].map((letter) => (
                      <div
                        key={letter}
                        className={`option-box ${
                          answer === letter ? 'selected' : ''
                        }`}
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
