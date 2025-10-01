import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import './FillBlank.css';

const FillBlank = ({ vocabularies, onProgressUpdated }) => {
  // Core study state
  const [studyWords, setStudyWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // UI state
  const [selectedBand, setSelectedBand] = useState('');
  const [wordCount, setWordCount] = useState(10);
  
  // Stats
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);

  const currentWord = studyWords[currentIndex];

  // Generate word with missing letters
  const generateWordBlank = (word) => {
    if (!word || word.length < 3) {
      return {
        display: word,
        answer: word,
        blanks: []
      };
    }
    
    const wordArray = word.split('');
    const blankCount = Math.min(2, Math.floor(word.length / 3)); // Max 2 blanks
    const blankPositions = [];
    
    // Select random positions for blanks (avoid first and last letter)
    for (let i = 0; i < blankCount; i++) {
      let pos;
      do {
        pos = Math.floor(Math.random() * (word.length - 2)) + 1; // Skip first and last
      } while (blankPositions.includes(pos));
      blankPositions.push(pos);
    }
    
    blankPositions.sort((a, b) => a - b);
    
    const displayArray = [...wordArray];
    const blanks = [];
    
    blankPositions.forEach(pos => {
      displayArray[pos] = '_';
      blanks.push({
        position: pos,
        letter: wordArray[pos].toLowerCase()
      });
    });
    
    return {
      display: displayArray.join(''),
      answer: word.toLowerCase(),
      blanks: blanks
    };
  };

  const wordBlank = currentWord ? generateWordBlank(currentWord.word) : null;

  // Check answer
  const checkAnswer = useCallback(() => {
    if (!wordBlank) return;
    
    const isCorrect = userAnswer.toLowerCase().trim() === wordBlank.answer;
    setShowResult(true);
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    }
  }, [userAnswer, wordBlank]);

  // Move to next question
  const nextQuestion = useCallback(async () => {
    if (!currentWord) return;
    
    // Update progress if correct
    if (showResult && userAnswer.toLowerCase().trim() === wordBlank.answer) {
      try {
        const id = currentWord._id || currentWord.id;
        await api.put(`/vocabulary/${id}/progress`, {
          type: 'fill_blank',
          score: 10,
          quality: 2 // Good
        });
        
        if (onProgressUpdated) onProgressUpdated();
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
    
    if (currentIndex < studyWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  }, [currentWord, showResult, userAnswer, wordBlank, currentIndex, studyWords.length, onProgressUpdated]);

  // Start learning session
  const startLearning = useCallback(async () => {
    if (!selectedBand) return;
    
    try {
      const res = await api.get(`/vocabulary?band=${selectedBand}&limit=50`);
      const words = res.data.data.vocabularies || [];
      
      if (words.length === 0) {
        alert('Không có từ vựng trong band này');
        return;
      }
      
      // Shuffle and take selected count
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setStudyWords(shuffled.slice(0, wordCount));
      setCurrentIndex(0);
      setUserAnswer('');
      setShowResult(false);
      setCompleted(false);
      setScore(0);
      setCorrectCount(0);
      setSessionStart(Date.now());
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  }, [selectedBand, wordCount]);

  // Reset study
  const resetStudy = () => {
    setStudyWords([]);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setCompleted(false);
    setScore(0);
    setCorrectCount(0);
    setSessionStart(null);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!showResult) {
        checkAnswer();
      } else {
        nextQuestion();
      }
    }
  };

  // Band selection screen
  if (studyWords.length === 0) {
    return (
      <div className="fillblank-container">
        <div className="study-setup">
          <div className="setup-header">
            <h1>Điền khuyết từ vựng</h1>
            <p>Điền các chữ cái còn thiếu trong từ</p>
          </div>
          
          <div className="band-selection">
            {[
              { band: '0-450', name: 'Mầm non', icon: '🌱', color: '#4CAF50' },
              { band: '450-700', name: 'Trung cấp', icon: '🌿', color: '#FF9800' },
              { band: '700+', name: 'Cao cấp', icon: '🌳', color: '#9C27B0' }
            ].map(({ band, name, icon, color }) => (
              <div key={band} className="band-option">
                <div 
                  className={`band-card ${selectedBand === band ? 'selected' : ''}`}
                  onClick={() => setSelectedBand(band)}
                >
                  <div className="band-icon" style={{ color }}>{icon}</div>
                  <div className="band-info">
                    <h3>{band}</h3>
                    <p>{name}</p>
                  </div>
                </div>
                
                {selectedBand === band && (
                  <div className="study-config">
                    <div className="config-item">
                      <label>Số từ:</label>
                      <select value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))}>
                        <option value={5}>5 từ</option>
                        <option value={10}>10 từ</option>
                        <option value={20}>20 từ</option>
                      </select>
                    </div>
                    
                    <div className="action-buttons">
                      <button className="action-btn learn" onClick={startLearning}>
                        <span className="btn-icon">✏️</span>
                        <span className="btn-text">Bắt đầu</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
    const accuracy = studyWords.length > 0 ? Math.round((correctCount / studyWords.length) * 100) : 0;
    
    return (
      <div className="fillblank-container">
        <div className="completion-screen">
          <div className="completion-header">
            <div className="completion-icon">🎯</div>
            <h2>Hoàn thành!</h2>
            <p>Bạn đã hoàn thành {studyWords.length} từ điền khuyết</p>
          </div>
          
          <div className="completion-stats">
            <div className="stat-card">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Độ chính xác</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{score}</div>
              <div className="stat-label">Điểm số</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{duration}s</div>
              <div className="stat-label">Thời gian</div>
            </div>
          </div>
          
          <div className="completion-actions">
            <button className="primary-btn" onClick={resetStudy}>
              Luyện tập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Study screen
  return (
    <div className="fillblank-container">
      <div className="study-header">
        <div className="progress-info">
          <span className="progress-text">Từ {currentIndex + 1} / {studyWords.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / studyWords.length) * 100}%` }}
            />
          </div>
        </div>
        <button className="back-btn" onClick={resetStudy}>
          ← Quay lại
        </button>
      </div>

      <div className="question-container">
        <div className="word-info">
          <div className="word-display">
            {wordBlank?.display.split('').map((char, index) => (
              <span 
                key={index} 
                className={`word-char ${char === '_' ? 'blank' : ''}`}
              >
                {char}
              </span>
            ))}
          </div>
          <div className="word-hint">
            <div className="meaning">{currentWord?.meaning}</div>
            <div className="vietnamese">{currentWord?.vietnamese}</div>
            {currentWord?.pronunciation && (
              <div className="pronunciation">{currentWord.pronunciation}</div>
            )}
          </div>
        </div>
        
        {!showResult && (
          <div className="answer-input">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập từ đầy đủ"
              autoFocus
            />
            <button onClick={checkAnswer}>Kiểm tra</button>
          </div>
        )}
        
        {showResult && (
          <div className={`result ${userAnswer.toLowerCase().trim() === wordBlank?.answer ? 'correct' : 'incorrect'}`}>
            {userAnswer.toLowerCase().trim() === wordBlank?.answer ? (
              <div className="correct-result">
                <span className="result-icon">✅</span>
                <span>Chính xác!</span>
              </div>
            ) : (
              <div className="incorrect-result">
                <span className="result-icon">❌</span>
                <span>Đáp án đúng: <strong>{currentWord?.word}</strong></span>
              </div>
            )}
            <button onClick={nextQuestion}>Từ tiếp theo</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillBlank;