import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import './ReviewFillBlank.css';

const ReviewFillBlank = ({ vocabularies, onProgressUpdated }) => {
  // Core study state
  const [reviewWords, setReviewWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // UI state
  const [selectedBand, setSelectedBand] = useState('');
  const [wordCount, setWordCount] = useState(10);
  const [shuffleMode, setShuffleMode] = useState(true);
  
  // Stats
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  
  // Band stats
  const [bandStats, setBandStats] = useState({
    '0-450': { total: 0, learned: 0, reviewDue: 0 },
    '450-700': { total: 0, learned: 0, reviewDue: 0 },
    '700+': { total: 0, learned: 0, reviewDue: 0 }
  });

  const currentWord = reviewWords[currentIndex];

  // Fetch band statistics
  const fetchBandStats = useCallback(async () => {
    const bands = ['0-450', '450-700', '700+'];
    const stats = {};
    
    for (const band of bands) {
      try {
        const [totalRes, learnedRes, reviewRes] = await Promise.all([
          api.get(`/vocabulary?band=${band}&limit=1000`),
          api.get(`/vocabulary?band=${band}&status=learned&limit=1000`),
          api.get(`/vocabulary/review/words?band=${band}&limit=1000`)
        ]);
        stats[band] = {
          total: totalRes.data.data.vocabularies.length,
          learned: learnedRes.data.data.vocabularies.length,
          reviewDue: reviewRes.data.data.words ? reviewRes.data.data.words.length : 0
        };
      } catch (err) {
        console.error(`Error fetching stats for band ${band}:`, err);
        stats[band] = { total: 0, learned: 0, reviewDue: 0 };
      }
    }
    
    setBandStats(stats);
  }, []);

  useEffect(() => {
    fetchBandStats();
  }, [fetchBandStats]);

  // Generate word with missing letters for review
  const generateReviewBlank = (word) => {
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

  const wordBlank = currentWord ? generateReviewBlank(currentWord.word) : null;

  // Check answer and update progress
  const checkAnswer = useCallback(async () => {
    if (!wordBlank || !currentWord) return;
    
    const isCorrect = userAnswer.toLowerCase().trim() === wordBlank.answer;
    setShowResult(true);
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
      
      // Update progress with quality rating
      try {
        const id = currentWord._id || currentWord.id;
        const quality = 2; // Good for correct answer
        const nextIntervalDays = 3; // 3 days for good answer
        
        await api.put(`/vocabulary/${id}/progress`, {
          type: 'review_fillblank',
          score: 10,
          quality: quality,
          nextIntervalDays: nextIntervalDays
        });
        
        // Refresh band stats
        fetchBandStats();
        if (onProgressUpdated) onProgressUpdated();
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  }, [userAnswer, wordBlank, currentWord, fetchBandStats, onProgressUpdated]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, reviewWords.length]);

  // Start review session
  const startReview = useCallback(async () => {
    if (!selectedBand) return;
    
    try {
      const res = await api.get(`/vocabulary/review/words?band=${selectedBand}`);
      const words = res.data.data.words || res.data.data || [];
      
      if (words.length === 0) {
        alert('Không có từ đến hạn ôn trong band này');
        return;
      }
      
      // Shuffle if enabled
      const finalWords = shuffleMode ? 
        [...words].sort(() => Math.random() - 0.5) : 
        words;
      
      setReviewWords(finalWords.slice(0, wordCount));
      setCurrentIndex(0);
      setUserAnswer('');
      setShowResult(false);
      setCompleted(false);
      setScore(0);
      setCorrectCount(0);
      setSessionStart(Date.now());
    } catch (error) {
      console.error('Error fetching review words:', error);
    }
  }, [selectedBand, wordCount, shuffleMode]);

  // Reset study
  const resetStudy = () => {
    setReviewWords([]);
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
  if (reviewWords.length === 0) {
    return (
      <div className="review-fillblank-container">
        <div className="study-setup">
          <div className="setup-header">
            <h1>Ôn tập điền khuyết</h1>
            <p>Ôn lại từ đến hạn bằng cách điền chữ cái còn thiếu</p>
          </div>
          
          <div className="band-selection">
            {[
              { band: '0-450', name: 'Mầm non', icon: '🌱', color: '#4CAF50' },
              { band: '450-700', name: 'Trung cấp', icon: '🌿', color: '#FF9800' },
              { band: '700+', name: 'Cao cấp', icon: '🌳', color: '#9C27B0' }
            ].map(({ band, name, icon, color }) => {
              const stats = bandStats[band];
              const progressPercent = stats.total > 0 ? (stats.learned / stats.total) * 100 : 0;
              
              return (
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
                    <div className="band-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercent}%`, backgroundColor: color }}
                        />
                      </div>
                      <div className="progress-text">
                        {stats.learned}/{stats.total} từ đã học
                      </div>
                    </div>
                  </div>
                  
                  {selectedBand === band && (
                    <div className="study-config">
                      <div className="config-row">
                        <div className="config-item">
                          <label>Số từ:</label>
                          <select value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))}>
                            <option value={5}>5 từ</option>
                            <option value={10}>10 từ</option>
                            <option value={20}>20 từ</option>
                            <option value={50}>50 từ</option>
                          </select>
                        </div>
                        
                        <div className="config-item">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={shuffleMode}
                              onChange={(e) => setShuffleMode(e.target.checked)}
                            />
                            Xáo trộn
                          </label>
                        </div>
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="action-btn review"
                          onClick={startReview}
                          disabled={stats.reviewDue === 0}
                        >
                          <span className="btn-icon">✏️</span>
                          <span className="btn-text">Bắt đầu ôn tập</span>
                          <span className="btn-count">({stats.reviewDue} từ)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
    const accuracy = reviewWords.length > 0 ? Math.round((correctCount / reviewWords.length) * 100) : 0;
    
    return (
      <div className="review-fillblank-container">
        <div className="completion-screen">
          <div className="completion-header">
            <div className="completion-icon">🎯</div>
            <h2>Hoàn thành ôn tập!</h2>
            <p>Bạn đã ôn lại {reviewWords.length} từ bằng điền khuyết</p>
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
            <div className="stat-card">
              <div className="stat-value">{correctCount}</div>
              <div className="stat-label">Từ đúng</div>
            </div>
          </div>
          
          <div className="completion-actions">
            <button className="primary-btn" onClick={resetStudy}>
              Ôn tập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Study screen
  return (
    <div className="review-fillblank-container">
      <div className="study-header">
        <div className="progress-info">
          <span className="progress-text">{currentIndex + 1} / {reviewWords.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
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

export default ReviewFillBlank;
